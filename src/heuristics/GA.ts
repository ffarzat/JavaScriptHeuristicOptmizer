import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';

import Individual from '../Individual';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Library from '../Library';

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

    intervalId;
    timeoutId;
    operationsCounter: number;
    totalCallBack: number;


    /**
    * Especific Setup
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {

        super.Setup(config, globalConfig);

        this.generations = config.generations;
        this.individuals = config.individuals;
        this.crossoverProbability = config.crossoverProbability;
        this.mutationProbability = config.mutationProbability;
        this.elitism = config.elitism;
        this.elitismPercentual = config.elitismPercentual;
        this.operationsCounter = 0;
    }

    /**
     * Run a single trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this.Start();
        this._logger.Write(`[GA] Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);

        this.SetLibrary(library, () => {
            this.CreatesFirstGeneration(this.Original, (population) => {
                this.executeStack(1, population, () => {
                    this.Stop();
                    cb(this.ProcessResult(trialIndex, this.Original, this.bestIndividual));
                    return;
                });
            });
        });
    }

    /**
     * Repeat recursively crossover, mutant e cutoff
     */
    private executeStack(generationIndex: number, population: Individual[], cb: () => void) {

        if (generationIndex == (this._config.generations + 1)) {
            cb(); //Done!
        } else {
            this._logger.Write(`[GA] Starting generation ${generationIndex}`);

            this.DoCrossovers(population, () => {
                this.DoMutations(population, () => {
                    this.DoPopuplationCut(population, () => {
                        generationIndex++
                        setTimeout(() => {
                            this.executeStack(generationIndex, population, cb);
                        }, 0);
                    });
                });
            });
        }
    }

    /**
     * Really process a operation over a recursively calls
     */
    ProcessOperations(population: Individual[], elements: number[], operation: string, cb: () => void) {

        setTimeout(() => {
            var elementIndex = elements.shift();
            var individual = population[elementIndex];

            if (operation == 'c') {
                this._logger.Write(`[GA] Asking CrossOver for an individual ${elementIndex}`);
                this.operationsCounter++
                this.CrossOver(individual, individual, (elements) => {
                    this._logger.Write(`[GA] Crossover done [${this.totalCallBack}]`);

                    this.totalCallBack++;

                    population.push(elements[0]);
                    population.push(elements[1]);

                    this.UpdateBest(elements[0]);
                    this.UpdateBest(elements[1]);

                });
            }

            if (operation == 'm') {
                this._logger.Write(`[GA] Doing a mutation with individual ${elementIndex++}`);

                var context: OperatorContext = new OperatorContext();
                context.First = individual;

                this.Mutate(context, (mutant) => {
                    this._logger.Write(`[GA] Mutation ${this.totalCallBack} done`);
                    this.totalCallBack++;
                    population.push(mutant);
                    this.UpdateBest(mutant);
                });
            }

            if (elements.length > 0) {
                setTimeout(this.ProcessOperations(population, elements, operation, cb), 50);
            }

        }, 50);


        if (this.intervalId == undefined) {
            this.intervalId = setInterval(() => {
                this._logger.Write(`[GA] wainting totalCallBack ${this.totalCallBack} complete [${this.operationsCounter}]`);
                if (this.operationsCounter == this.totalCallBack) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;
                    cb();
                }
            }, 1 * 1000);
        }



    }

    /**
     * Calculates crossovers operations over a probability
     */
    private DoCrossovers(population: Individual[], cb: () => void) {
        let crossoverIndex = 0;
        let totalCallback = 0;
        let crossoverIndexes: number[] = [];
        let totalOperationsInternal = 0;

        for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
            var crossoverChance = this.GenereateRandom(0, 100);
            if (this.crossoverProbability >= crossoverChance) {
                totalOperationsInternal++;
                crossoverIndexes.push(individualIndex);
            }
        }

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        this.ProcessOperations(population, crossoverIndexes, 'c', () => {
            this._logger.Write(`[GA] CrossOvers done.`);
            this.operationsCounter = 0;
            this.totalCallBack = 0;
            cb();
        });
    }


    /**
     * Calculates mutation operations over a probability
     */
    private DoMutations(population: Individual[], cb: () => void) {
        let crossoverIndex = 0;
        let totalCallback = 0;
        let crossoverIndexes: number[] = [];
        let totalOperationsInternal = 0;

        for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
            var chance = this.GenereateRandom(0, 100);
            if (this.mutationProbability >= chance) {
                totalOperationsInternal++;
                crossoverIndexes.push(individualIndex);
            }
        }

        this.operationsCounter = 0;
        this.totalCallBack = 0;

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

        if (this.elitism) {
            var countElitism = Math.floor((this.individuals * this.elitismPercentual) / 100);
            this._logger.Write(`[GA] Using Elitism. Cuting off ${countElitism} individuals`);
            population.sort((a, b) => { return a.testResults.fit > b.testResults.fit ? 1 : 0; });
            population.splice(0, countElitism);
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
        var total = 0;
        var mutantIndex: number = 0;

        this.DoMutationsPerTime(0, [], untill, (mutants) => {
            this._logger.Write(`[GA] Repopulate: ${untill} done`);

            mutants.forEach(element => {
                this.UpdateBest(element);
                population.push(element);
            });

            cb(population);
        });

    }

    /**
 * Do N mutants per time
 */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], totalMutants: number, cb: (mutants: Individual[]) => void) {

        if (counter == totalMutants) {
            this._logger.Write(`[GA] Done requests. Just waiting`);
            return;
        } else {

            this._logger.Write(`[GA] Asking  mutant ${counter}`);
            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            this.operationsCounter++;
            this.Mutate(context, (mutant) => {
                neighbors.push(mutant);

                this._logger.Write(`[GA] Mutant done: ${neighbors.length}`);
            });

            counter++;

            setTimeout(() => {
                this.DoMutationsPerTime(counter, neighbors, totalMutants, cb);
            }, 0);
        }

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

        //this._logger.Write(`[GA] ${this.intervalId == undefined}`);
        if (this.intervalId == undefined) {
            this.intervalId = setInterval(() => {
                this._logger.Write(`[GA] Interval: Neighbors:${neighbors.length}, Operations ${this.operationsCounter}`);
                if (neighbors.length == this.operationsCounter) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;
                    this._logger.Write(`[GA] Interval: doing callback`);
                    cb(neighbors);
                }
            }, 1 * 1000);
        }
    }


    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual, cb: (individuals: Individual[]) => void) {
        var localPopulation: Individual[] = [];
        this.Repopulate(localPopulation, this.individuals - 1, (newIndividuals: Individual[]) => {
            newIndividuals.unshift(original);
            cb(newIndividuals);
        });
    }
}