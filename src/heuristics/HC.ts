/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import NodeIndex from './NodeIndex';
import Library from '../Library';


//[FunctionExpression, FunctionDeclaration and ArrowFunctionExpression]

/**
* Hill Climbing Search for Code Improvement
*/
export default class HC extends IHeuristic {

    neighborApproach: string;
    trials: number
    nodesType: string[];
    howManyTimes: number;

    intervalId;
    operationsCount: number;
    typeIndexCounter: number;

    totalOperationsCounter: number;

    /**
    * Especific Setup
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {

        super.Setup(config, globalConfig, allHosts);

        this.neighborApproach = config.neighborApproach;
        this.trials = config.trials;
        this.nodesType = config.nodesType;
        this.typeIndexCounter = 0;

    }

    /**
    * Run the trial
    */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this._logger.Write(`[HC] Starting  Trial ${trialIndex}`);
        this._logger.Write(`[HC] Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`[HC] Using nodesType: ${this.nodesType}`);


        this.SetLibrary(library, (sucess: boolean) => {
            if (sucess) {
                this.Start();

                var totalTrials = this.trials;
                this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
                this._logger.Write(`[HC] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);

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
     * Executa o HC de maneira clássica, usando todo o código da biblioteca
     */
    runGlobal(trialIndex: number, cb: (results: TrialResults) => void): void {
        var nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual);
        var indexes: NodeIndex = nodesIndexList[0];
        this._logger.Write(`[HC] Initial index: ${indexes.Type}`);

        this.executeCalculatedTimes(0, indexes, nodesIndexList, () => {
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
            cb(results);
            return;
        });
    }

    /**
     * Executa o HC sob a perspectiva de função
     */
    runByFunction(trialIndex: number, cb: (results: TrialResults) => void): void {
        this.totalOperationsCounter = 0;
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original
        this.ExecutarPorFuncao(trialIndex, cb);
    }


    /**
     * Surrogate para a runByFunction
     */
    private ExecutarPorFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();

        if (funcaoAtual == undefined || funcaoAtual == "undefined") {
            this._logger.Write(`[HC] Não há mais funções para otimizar!`);
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
            cb(results);
            return;
        }
        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        this._logger.Write(`[HC] Otimizando a função ${this.ActualFunction}! ${typeof this.ActualFunction}`);
        //Array com todos os indices de nó
        let nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual);
        this.typeIndexCounter = 0;
        //Indice atual
        let indexes: NodeIndex = nodesIndexList[this.typeIndexCounter];
        this._logger.Write(`[HC] Initial index: ${indexes.Type}`);

        this.ExecutarMutacao(0, indexes, nodesIndexList, trialIndex, cb);

    }

    //Executa uma mutação simples
    private ExecutarMutacao(time: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], trialIndex: number, cb: (results: TrialResults) => void) {
        //this._logger.Write(`[HC] Orçamento: ${this.trials - this.operationsCount}`);
        this.operationsCount = 0;



        process.nextTick(() => {
            this.ExecutarMutacoesConfiguradas(0, [], indexes, nodesIndexList, (mutants, updatedIndexes, finish) => {

                if (time == this.howManyTimes || finish) { //Done!
                    this.Stop();
                    var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
                    cb(results);
                    return;
                } else {
                    this.ExecutarPorFuncao(trialIndex, cb); //recursivo
                }

            });
        });
    }

    /**
    * Do N mutants per time
    */
    private ExecutarMutacoesConfiguradas(counter: number, neighbors: Individual[], indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: (mutants: Individual[], indexes: NodeIndex, done: boolean) => void) {
        let itsover: boolean = false;

        if (this.totalOperationsCounter >= this.trials) {
            this._logger.Write(`[HC] Orçamento Esgotado ${this.trials}`);
            itsover = true
        }
        else {
            this._logger.Write(`[HC] Orçamento atual ${this.trials - this.totalOperationsCounter}`);
        }


        //Rest some mutant to process?
        if (counter < this._config.neighborsToProcess) {
            // its over actual index? (IF, CALL, etc)
            if (indexes.Indexes[indexes.ActualIndex] == undefined) {
                indexes = nodesIndexList[this.typeIndexCounter];
                this._logger.Write(`[HC] Tentando mudar de indice [${this.typeIndexCounter}]`);


                if (indexes == undefined || indexes.Indexes.length == 0) {
                    this._logger.Write(`[HC] Todos os vizinhos foram visitados`);
                    itsover = true;
                    cb(neighbors, indexes, (this.functionStack.length == 0));
                    return;
                }
            }

            //All neighbors were visited?
            if (!itsover) {
                this.totalOperationsCounter++;
                this.MutateBy(this.bestIndividual.Clone(), indexes, (mutant) => {
                    neighbors.push(mutant);
                });

                counter++;
                this.operationsCount = counter;
                process.nextTick(() => {
                    this.ExecutarMutacoesConfiguradas(counter++, neighbors, indexes, nodesIndexList, cb);
                });
            }

        }

        //Process all neighbors?
        if (neighbors.length == this.operationsCount) {
            cb(neighbors, indexes, false);
            return;
        }

        //Waiting to be done!
        if (!this.intervalId) {

            this.intervalId = setInterval(() => {
                //this._logger.Write(`[HC] setInterval -> Neighbors ${neighbors.length}, Operations ${this.operationsCount}`);
                //, typeIndexCounter ${this.typeIndexCounter}, nodesIndexList.length ${nodesIndexList.length}, indexes.ActualIndex ${indexes.ActualIndex}, indexes.Indexes.length ${indexes.Indexes.length}`);

                if (neighbors.length == this.operationsCount) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;

                    if (this.typeIndexCounter == (nodesIndexList.length - 1) && (indexes.ActualIndex == indexes.Indexes.length - 1)) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(neighbors, indexes, true);
                    }
                    else {
                        cb(neighbors, indexes, false);
                    }
                }
            }, 1 * 1000); //each ten secs
        }
    }


    /**
    * How many time to execute DoMutationsPerTime
    */
    private executeCalculatedTimes(time: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: () => void) {

        this.operationsCount = 0;

        this.DoMutationsPerTime(0, [], indexes, nodesIndexList, (mutants, updatedIndexes, finish) => {
            this._logger.Write(`[HC]How Many: ${time}`);
            var foundNewBest = false;

            time++;

            mutants.forEach(element => {
                foundNewBest = this.UpdateBest(element);

                if (foundNewBest && this.neighborApproach === 'FirstAscent') {
                    //Jump to first best founded
                    nodesIndexList = this.DoIndexes(this.bestIndividual);
                    indexes = nodesIndexList[0];
                    return;
                }

                if (foundNewBest && this.neighborApproach === 'LastAscent') {
                    //Jump to best of all
                    nodesIndexList = this.DoIndexes(this.bestIndividual);
                }

            });


            if (time == this.howManyTimes || finish) { //Done!
                cb();
            } else {
                process.nextTick(() => {
                    this.executeCalculatedTimes(time, updatedIndexes, nodesIndexList, cb);
                });
            }

        });
    }



    /**
    * Do N mutants per time
    */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: (mutants: Individual[], indexes: NodeIndex, done: boolean) => void) {
        let itsover: boolean = false;

        //Rest some mutant to process?
        if (counter < this._config.neighborsToProcess) {
            // its over actual index? (IF, CALL, etc)
            if (indexes.ActualIndex == indexes.Indexes.length - 1) {
                //Try change to next index

                // its over all index?
                console.log(`[HC] this.typeIndexCounter: ${this.typeIndexCounter}`);
                console.log(`[HC] indexes.Indexes.length: ${indexes.Indexes.length}`);

                if (this.typeIndexCounter >= nodesIndexList.length - 1) {
                    this._logger.Write(`[HC] All neighbors were visited`);
                    itsover = true;
                    return;
                } else {
                    //change node index
                    this.typeIndexCounter++;
                    indexes = nodesIndexList[this.typeIndexCounter];
                    this._logger.Write(`[HC] Change index: ${indexes.Type}, ${this.typeIndexCounter}`);
                }
            }

            //All neighbors were visited?
            if (!itsover) {
                this.MutateBy(this.bestIndividual.Clone(), indexes, (mutant) => {
                    neighbors.push(mutant);
                });

                counter++;
                this.operationsCount = counter;
                process.nextTick(() => {
                    this.DoMutationsPerTime(counter++, neighbors, indexes, nodesIndexList, cb);
                });
            }

        }

        //Process all neighbors?
        if (neighbors.length == this.operationsCount) {
            cb(neighbors, indexes, false);
            return;
        }

        //Waiting to be done!
        if (!this.intervalId) {

            this.intervalId = setInterval(() => {
                //this._logger.Write(`[HC] setInterval -> Neighbors ${neighbors.length}, Operations ${this.operationsCount}, typeIndexCounter ${this.typeIndexCounter}, nodesIndexList.length ${nodesIndexList.length}, indexes.ActualIndex ${indexes.ActualIndex}, indexes.Indexes.length ${indexes.Indexes.length}`);

                if (neighbors.length == this.operationsCount) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;

                    if (this.typeIndexCounter == (nodesIndexList.length - 1) && (indexes.ActualIndex == indexes.Indexes.length - 1)) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(neighbors, indexes, true);
                    }
                    else {
                        cb(neighbors, indexes, false);
                    }
                }
            }, 1 * 1000); //each ten secs
        }
    }

    /**
    * Populates the indexes for NodeType inside Code
    */
    DoIndexes(original: Individual): NodeIndex[] {
        var nodesIndexList: NodeIndex[] = [];

        if (this.nodesType.length > 0) {
            this.nodesType.forEach(element => {
                var nodeIndex = this.IndexBy(element, original);
                nodesIndexList.push(nodeIndex);
                this._logger.Write(`[HC] DoIndexes ${element}: ${nodeIndex.Indexes.length}`);
            });
        }
        else {
            this._logger.Write(`[HC] FATAL: There is no configuration for NodeType for HC Optmization`);
            throw "[HC] There is no configuration for NodeType for HC Optmization";
        }

        return nodesIndexList;
    }

}