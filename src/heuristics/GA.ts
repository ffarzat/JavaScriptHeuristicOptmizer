import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';

import Individual from '../Individual';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Library from '../Library';

import fs = require('fs');
import path = require('path');

var UglifyJS = require("uglify-es");


var uglifyOptions = {
    mangle: true,
    compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
    }
};


/**
 * Genetic Algorithm for Code Improvement
 */
export default class GA extends IHeuristic {


    generations: number;
    individuals: number;
    crossoverProbability: number;
    mutationProbability: number;
    elitism: boolean;
    elitismPercentual: number;

    RepopulateIntervalId;
    DoMutationsIntervalId;
    timeoutId;
    operationsCounter: number;
    totalCallBack: number;

    proximaGeracaoDeTroca: number;

    generationIndexForLog: number;


    /**
    * Especific Setup
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {

        super.Setup(config, globalConfig, allHosts);

        this.generations = config.generations;
        this.individuals = config.individuals;
        this.crossoverProbability = config.crossoverProbability;
        this.mutationProbability = config.mutationProbability;
        this.elitism = config.elitism;
        this.elitismPercentual = config.elitismPercentual;
        this.totalCallBack = 0;
        this.operationsCounter = 0;
        this.proximaGeracaoDeTroca = 1;
        this.generationIndexForLog = 1;
    }

    /**
     * Run a single trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this._logger.Write(`[GA] Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);

        this.SetLibrary(library, (sucess: boolean) => {
            if (sucess) {
                this.Start();

                this.RefreshIndexList();

                switch (this.nodesSelectionApproach) {
                    case "Global":
                        this.runGlobal(trialIndex, cb);
                        break;

                    case "ByFunction":
                        this.runByFunction(trialIndex, cb);
                        break;

                    default:
                        this._logger.Write(this.nodesSelectionApproach);
                        cb(undefined);
                        break;
                }

            }
            else {
                cb(undefined);
                return;
            }
        });
    }

    /**
     * Surrogate para execução global
     */
    private runGlobal(trialIndex: number, cb: (results: TrialResults) => void) {

        var result = UglifyJS.minify(this.bestIndividual.ToCode(), uglifyOptions);
        this.bestIndividual.modificationLog.push(`0;original;${result.code.length}`);

        var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "GA");
        var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
        var logString = this.bestIndividual.modificationLog[this.bestIndividual.modificationLog.length - 1];
        fs.appendFileSync(file, `counter;index;instructionType;totalChars;OperationType \n`);
        fs.appendFileSync(file, `0;${logString} \n`);


        this.CreatesFirstGeneration(this.Original, (population) => {
            this.executeStack(1, population, () => {
                this.Stop();
                cb(this.ProcessResult(trialIndex, this.Original, this.bestIndividual));
                return;
            });
        });
    }

    /**
    * Surrogate para execução por função
    */
    private runByFunction(trialIndex: number, cb: (results: TrialResults) => void) {
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();
        this.ActualFunction = funcaoAtual;

        this.CreatesFirstGeneration(this.Original, (population) => {
            this.executeStack(1, population, () => {
                this.Stop();
                var bestForAMoment = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
                cb(this.ProcessResult(trialIndex, this.Original, bestForAMoment));
                return;
            });
        });
    }


    TrocarFuncao(cb: () => void) {
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();

        if (funcaoAtual == undefined || funcaoAtual == "undefined") {
            this._logger.Write(`[GA] Não há mais funções para otimizar!`);
            cb();
            return;
        }
        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        this._logger.Write(`[GA] Otimizando a função ${this.ActualFunction}!`);
    }

    /**
     * Repeat recursively crossover, mutant e cutoff
     */
    private executeStack(generationIndex: number, population: Individual[], cb: () => void) {

        if (generationIndex == (this._config.generations + 1)) {
            cb(); //Done!
        } else {
            this._logger.Write(`[GA] Starting generation ${generationIndex}`);
            this.generationIndexForLog = generationIndex;
            if (this.nodesSelectionApproach == "ByFunction") {
                this._logger.Write(`[GA] A função ${this.ActualFunction} será otimizada por ${qtdGeracoes} gerações`);

                //Determina quantas execuções para troca de função
                if (this.proximaGeracaoDeTroca === generationIndex) {
                    this.TrocarFuncao(cb);
                    var qtdGeracoes = 1; //this._astExplorer.GenereateRandom(generationIndex, (this._config.generations));
                    this.proximaGeracaoDeTroca = (generationIndex + qtdGeracoes);
                }
            }

            this.DoCrossovers(population, () => {
                this.DoMutations(population, () => {
                    this.DoPopuplationCut(population, () => {
                        generationIndex++
                        process.nextTick(() => {
                            this.executeStack(generationIndex, population, cb);
                        });
                    });
                });
            });
        }
    }

    /**
     * Really process a operation over a recursively calls
     */
    ProcessOperations(population: Individual[], elements: number[], operation: string, cb: () => void) {

        process.nextTick(() => {
            var elementIndex = elements.shift();
            var individual = population[elementIndex];
            var element2Index = this._astExplorer.GenereateRandom(0, population.length - 1);
            var individual2 = population[element2Index];

            //this._logger.Write(`Cruzando individuos: ${elementIndex} e ${element2Index}`);
            
            if (operation == 'c') {
                //this._logger.Write(`[GA] Asking CrossOver for an individual ${elementIndex}`);
                this.operationsCounter++
                this.CrossOver(individual, individual2, (elements) => {
                    this._logger.Write(`elements[0] tem resultados? ${elements[0].testResults != undefined}`);
                    //this._logger.Write(`elements[1] tem resultados? ${elements[1].testResults != undefined}`);

                    try {
                        this.totalCallBack++;
                        this._logger.Write(`[GA] Crossover done [${this.totalCallBack}]`);

                        var isBetter = this.UpdateBest(elements[0]);

                        if (isBetter) {
                            //Save modifications log
                            var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "GA");
                            var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
                            var logString = elements[0].modificationLog[elements[0].modificationLog.length - 1];
                            fs.appendFileSync(file, `${this.generationIndexForLog};${logString};c \n`);
                        }
                        elements[0].AST = {};
                        population.push(elements[0]);
                        //population.push(elements[1]);

                    } catch (error) {
                        this._logger.Write(`[GA] ProcessOperations/Crossover error: ${error.stack}`);
                    }
                });
            }

            if (operation == 'm') {
                //this._logger.Write(`[GA] Doing a mutation with individual ${elementIndex++}`);

                var context: OperatorContext = new OperatorContext();
                context.First = individual;
                this.operationsCounter++

                var indicesDoIndividuo = this.DoIndexes(this.Original).slice();
                var indexes = indicesDoIndividuo[this._astExplorer.GenereateRandom(0, indicesDoIndividuo.length - 1)];
                indexes.ActualIndex = this._astExplorer.GenereateRandom(0, indexes.Indexes.length - 1)

                this.MutateBy(individual.Clone(), indexes, (mutant) => {
                    //this._logger.Write(`[GA] Mutation ${this.totalCallBack} done`);
                    this._logger.Write(`mutant tem resultados? ${mutant.testResults != undefined}`);
                    try {
                        this.totalCallBack++;
                        if (mutant == undefined || mutant.testResults == undefined) {
                            var localBest = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
                            mutant = localBest.Clone();
                        }

                        var isBetter = this.UpdateBest(mutant);
                        if (isBetter) {
                            //Save modifications log
                            var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "GA");
                            var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
                            var logString = mutant.modificationLog[mutant.modificationLog.length - 1];
                            fs.appendFileSync(file, `${this.generationIndexForLog};${logString};m \n`);
                        }
                        
                        mutant.AST = {};
                        population.push(mutant);

                    } catch (error) {
                        this._logger.Write(`[GA] ProcessOperations/Mutate error: ${error.stack}`);
                    }
                });
            }

            if (elements.length > 0) {
                process.nextTick(() => { this.ProcessOperations(population, elements, operation, cb); });
            }
            else {
                this._logger.Write(`[GA] Operation requests done. Just waiting for clients.`);

                if (this.RepopulateIntervalId == undefined) {

                    this.RepopulateIntervalId = setInterval(() => {
                        //this._logger.Write(`[GA] wainting totalCallBack ${this.totalCallBack} complete [${this.operationsCounter}]`);
                        this._logger.Write(`[GA] ProcessOperations: ${this.totalCallBack}/${this.operationsCounter}`);

                        if (this.totalCallBack >= this.operationsCounter) {
                            clearInterval(this.RepopulateIntervalId);
                            this.RepopulateIntervalId = undefined;
                            cb();
                        }
                    }, 1 * 1000);
                }
            }

        });
    }

    /**
     * Calculates crossovers operations over a probability
     */
    private DoCrossovers(population: Individual[], cb: () => void) {
        let crossoverIndex = 0;
        let crossoverIndexes: number[] = [];
        let totalOperationsInternal = 0;

        for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
            var crossoverChance = this.GenereateRandom(0, 100);
            if (this.crossoverProbability > crossoverChance) {
                this._logger.Write(`[GA] CrossoverChance: ${crossoverChance}`);
                try {
                    totalOperationsInternal++;
                    crossoverIndexes.push(individualIndex);
                } catch (error) {
                    this._logger.Write(`[GA] Crossover error: ${error.stack}`);
                    cb();
                    return;
                }
            }
        }

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        if (totalOperationsInternal == 0) {
            cb();
            return;
        }

        this.ProcessOperations(population, crossoverIndexes, 'c', () => {
            this._logger.Write(`[GA] CrossOvers done.`);
            this.operationsCounter = 0;
            this.totalCallBack = 0;
            cb();
            return;
        });
    }


    /**
     * Calculates mutation operations over a probability
     */
    private DoMutations(population: Individual[], cb: () => void) {
        let crossoverIndex = 0;
        let crossoverIndexes: number[] = [];
        let totalOperationsInternal = 0;

        for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
            var chance = this.GenereateRandom(0, 100);
            if (this.mutationProbability > chance) {
                totalOperationsInternal++;
                crossoverIndexes.push(individualIndex);
            }
        }

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        if (totalOperationsInternal == 0) {
            cb();
            return;
        }

        this.ProcessOperations(population, crossoverIndexes, 'm', () => {
            this._logger.Write(`[GA] Mutation done.`);
            this.operationsCounter = 0;
            this.totalCallBack = 0;
            cb();
        });
    }

    /**
     * Releases Elitism over population
     */
    private DoPopuplationCut(population: Individual[], cb: () => void) {
        for (var index = 0; index < population.length; index++) {
            var element = population[index];
            if (element.testResults == undefined) {
                population.splice(index, 1); //cut off
                this._logger.Write(`[GA] ${index} has no TestResults`);
            }
        }

        var countTotal = Math.floor(population.length - this._config.individuals);
        this._logger.Write(`[GA] Sort population`);
        try {
            population.sort((a, b) => { return a.testResults.fit > b.testResults.fit ? 1 : 0; });    
        } catch (error) {
            this._logger.Write(`[GA] Population cut error`);    
        }
        
        this._logger.Write(`[GA] Population cut (${population.length}-${countTotal})`);
        population.splice(this._config.individuals - 1, countTotal);
        this._logger.Write(`[GA] Population now:${population.length}`);

        if (this.elitism) {
            var countElitism = Math.floor((this.individuals * this.elitismPercentual) / 100);

            this._logger.Write(`[GA] Using Elitism. Cuting off ${countElitism} individuals`);
            population.splice(this._config.individuals - 1, countElitism);

            this.Repopulate(population, countElitism, (elements) => {
                cb();
            });
        }
        else {
            population.splice(0, this.individuals);
            if (population.length < this.individuals) {
                this.Repopulate(population, (this.individuals - population.length), (elements) => {
                    cb();
                });
            }
        }
    }

    /**
     * Repopulates using Mutation
     */
    private Repopulate(population: Individual[], untill: number, cb: (individuals: Individual[]) => void) {
        this._logger.Write(`[GA] Initializing a new population [+ ${untill} new individuals]`);

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        this.DoMutationsPerTime(0, [], untill, (mutants) => {
            this._logger.Write(`[GA] Repopulate: ${untill} done`);

            mutants.forEach(element => {
                var isBetter = this.UpdateBest(element);

                if (isBetter) {
                    //Save modifications log
                    var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "GA");
                    var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
                    var logString = element.modificationLog[element.modificationLog.length - 1];
                    fs.appendFileSync(file, `${this.generationIndexForLog};${logString};m \n`);
                }


                population.push(element);
                //console.log(`Novo individuo: ${element.removedIDS[0]}`)
            });

            this._logger.Write(`[GA] Population inside: ${population.length}`);
            cb(population);
            return;
        });


        if (this.RepopulateIntervalId == undefined) {
            var start = new Date();

            this.RepopulateIntervalId = setInterval(() => {
                //this._logger.Write(`[GA] wainting totalCallBack ${this.totalCallBack} complete [${this.operationsCounter}]`);
                this._logger.Write(`[GA] Repopulate: ${this.totalCallBack}/${this.operationsCounter}`);

                if (this.totalCallBack >= this.operationsCounter) {
                    this.totalCallBack = 0;

                    this.operationsCounter = 0;

                    clearInterval(this.RepopulateIntervalId);
                    this.RepopulateIntervalId = undefined;

                    this._logger.Write(`[GA] Population final: ${population.length}`);


                    cb(population);
                    return;
                }

            }, 1 * 1000);
        }


    }

    /**
    * Do N mutants per time
    */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], totalMutants: number, cb: (mutants: Individual[]) => void) {

        if (counter == totalMutants) {
            this._logger.Write(`[GA] Done requests. Just waiting`);

            //this._logger.Write(`[GA] Interval: this.timeoutId:${this.timeoutId}, this.intervalId ${this.intervalId}`);

            if (this.timeoutId == undefined) {
                this.timeoutId = setTimeout(() => {
                    //
                    if (neighbors.length < this.operationsCounter) {
                        clearTimeout(this.timeoutId);
                        this.timeoutId = undefined;
                        this.DoMutationsPerTime(counter, neighbors, totalMutants, cb); //do again
                    }

                }, this._globalConfig.clientTimeout * 1000);
            }

            if (this.DoMutationsIntervalId == undefined) {
                this.DoMutationsIntervalId = setInterval(() => {
                    //this._logger.Write(`[GA] Interval: Neighbors:${neighbors.length}, Operations ${this.operationsCounter}`);
                    this._logger.Write(`[GA] DoMutationsPerTime: ${neighbors.length}[${this.operationsCounter}]`);
                    if (neighbors.length == this.operationsCounter) {
                        clearInterval(this.DoMutationsIntervalId);
                        this.DoMutationsIntervalId = undefined;
                        this._logger.Write(`[GA] Interval: doing callback ${neighbors.length}`);
                        this.totalCallBack = neighbors.length;
                        cb(neighbors);
                        return;
                    }
                }, 1 * 1000);
            }

            return;

        } else {

            //this._logger.Write(`[GA] Asking  mutant ${counter}`);
            var localBest = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
            //var context: OperatorContext = new OperatorContext();
            //context.First = localBest;
            this.operationsCounter++;
            this._logger.Write(`[GA] this.operationsCounter ${this.operationsCounter}`);

            var indexes = this.updatedIndexList[this._astExplorer.GenereateRandom(0, this.updatedIndexList.length - 1)];
            indexes.ActualIndex = this._astExplorer.GenereateRandom(0, indexes.Indexes.length - 1)

            this.MutateBy(localBest.Clone(), indexes, (mutant) => {
                try {
                    
                    if (mutant == undefined) {
                        mutant = localBest.Clone();
                    }

                    neighbors.push(mutant);

                } catch (error) {
                    this._logger.Write(`[GA] Mutant error: ${error.stack}`);
                }
                finally{
                    this.totalCallBack++;
                }
            });

            /*
            this.Mutate(context, (mutant) => {

                try {
                    this.totalCallBack++;
                    //if (mutant == undefined || mutant.testResults == undefined) {
                    //process.exit()
                    //}

                    neighbors.push(mutant);
                } catch (error) {
                    this._logger.Write(`[GA] Mutant error: ${error.stack}`);
                }
            });
            */

            counter++;

            process.nextTick(() => {
                this.DoMutationsPerTime(counter, neighbors, totalMutants, cb);
            });
        }
    }

    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual, cb: (individuals: Individual[]) => void) {
        this.Repopulate([], this.individuals - 1, (newIndividuals: Individual[]) => {
            //newIndividuals.unshift(original);
            cb(newIndividuals);
        });
    }
}