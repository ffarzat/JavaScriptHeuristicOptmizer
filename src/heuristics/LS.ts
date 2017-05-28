/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import NodeIndex from './NodeIndex';
import Library from '../Library';


/**
* Hill Climbing Otimizado
*/
export default class LS extends IHeuristic {

    neighborApproach: string;
    trials: number

    howManyTimes: number;

    intervalId;
    typeIndexCounter: number;

    ramdonRestart: boolean;
    restartAtEnd: boolean;
    ramdonNodes: boolean;

    restartCounter: number;
    findBestInThisTrial: boolean;

    indicesParaRemover: Object[];


    /**
    * Especific Setup
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {

        super.Setup(config, globalConfig, allHosts);

        this.neighborApproach = config.neighborApproach;
        this.trials = config.trials;
        this.restartAtEnd = config.restartAtEnd;
        this.ramdonRestart = config.ramdonRestart;
        this.ramdonNodes = config.ramdonNodes;

        this.typeIndexCounter = 0;
        this.totalOperationsCounter = 0;
        this.neighbors = [];
        this.findBestInThisTrial = false;
        this.restartCounter = 0;
        this.indicesParaRemover = [];

    }

    /**
     * Shuffle this.nodeTypes Array items
     */
    shuffleNodeTypes() {
        var currentIndex = this.nodesType.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.nodesType[currentIndex];
            this.nodesType[currentIndex] = this.nodesType[randomIndex];
            this.nodesType[randomIndex] = temporaryValue;
        }



        for (var index = 0; index < this.nodesType.length; index++) {
            var element = this.nodesType[index];
            this._logger.Write(`    ${index} -> ${element}`);
        }
    }

    /**
    * Run the trial
    */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this.totalOperationsCounter = 0;
        this.neighbors = [];
        this._logger.Write(`[HC] Starting  Trial ${trialIndex}`);
        this._logger.Write(`[HC] Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`[HC] Using nodesType: ${this.nodesType}`);

        this.SetLibrary(library, (sucess: boolean) => {
            if (sucess) {
                this.Start();
                var totalTrials = this.trials;
                this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
                this._logger.Write(`[HC] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);


                this._logger.Write(`[HC] Shuffle nodeTypes ${this.ramdonNodes}`);

                if (this.ramdonNodes) {
                    this.shuffleNodeTypes();
                }

                switch (this.nodesSelectionApproach) {
                    case "Global":
                        this.reRunGlobal(trialIndex, 0, (results) => {
                            cb(results);
                        });
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

    reRunGlobal(trialIndex: number, time: number, cb: (results: TrialResults) => void) {

        this.runGlobal(trialIndex, time, (contagem) => {
            if (this.restartAtEnd && contagem < this.howManyTimes) {

                this.restartCounter++;

                this._logger.Write(`[HC] Restart! Actual internal trial: ${contagem}`);
                this._logger.Write(`[HC] this.restartCounter: ${this.restartCounter}`);

                if (this.findBestInThisTrial) {
                    this.restartCounter = 0;
                }

                if (this.restartCounter > 1 && !this.ramdonNodes) { //se vai reiniciar pela segunda vez e não encontrou nada na última execução além de não embaralhar os nós, pode parar pois o resultado não mudará mais.
                    this.Stop();
                    var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
                    cb(results);
                    return;
                }




                if (this.ramdonRestart) {
                    this.typeIndexCounter = this._astExplorer.GenereateRandom(0, this.nodesType.length - 1);
                    this._logger.Write(`[HC] Its a ramdon restart! Back from ${this.nodesType[this.typeIndexCounter]} `);
                }
                else {
                    this.typeIndexCounter = 0;
                }


                process.nextTick(() => {
                    this.findBestInThisTrial = false; //força o false antes de executar
                    this.reRunGlobal(trialIndex, contagem + 1, cb);
                });
            } else {
                this.Stop();
                var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
                cb(results);
                return;
            }
        })
    }

    /**
     * Executa o HC de maneira clássica, usando todo o código da biblioteca
     */
    runGlobal(trialIndex: number, time: number, cb: (internalTrialsCount: number) => void): void {
        var nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual);
        var indexes: NodeIndex = nodesIndexList[0];
        this._logger.Write(`[HC] Initial index: ${indexes.Type}`);

        this.executeCalculatedTimes(time, indexes, nodesIndexList, (quantasVezesJaExecutou: number) => {
            cb(quantasVezesJaExecutou);
            return;
        });
    }


    /**
    * How many time to execute DoMutationsPerTime
    */
    private executeCalculatedTimes(time: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: (time: number) => void) {

        this.operationsCount = 0;
        var mudarIndiceQuandoEncontraMelhor = true;

        this.DoMutationsPerTime(0, [], indexes, nodesIndexList, (mutants, updatedIndexes, finish) => {
            time++;
            this._logger.Write(`[HC]time: ${time}/${this.howManyTimes}`);
            var foundNewBest = false;

            try {
                mutants.forEach(element => {

                    if (element.testResults.passedAllTests && element.indicesRemovidos.length > 0) {
                        this._logger.Write(`Armazenar como melhor: ${element.indicesRemovidos[0]['tipo']}, ${element.indicesRemovidos[0]['indice']}`);
                        this.indicesParaRemover.push(element.indicesRemovidos[0]);
                        element.indicesRemovidos = [];
                    }
                });

            } catch (error) {
                this._logger.Write(`ERRO: ${error}`);
            }

            if (time == this.howManyTimes || finish) { //Done!
                cb(time);
            } else {
                process.nextTick(() => {

                    //change node index?
                    if (indexes.ActualIndex > indexes.Indexes.length - 1 && (this.typeIndexCounter < nodesIndexList.length - 1) && mudarIndiceQuandoEncontraMelhor) {



                        if (this.indicesParaRemover.length > 0) {
                            this._logger.Write(`Processar ${this.indicesParaRemover.length} indices`);

                            var novoMelhor = this.ExcluirTodosOsNos(this.bestIndividual.Clone(), this.indicesParaRemover);
                            novoMelhor.testResults.fit = (this.bestFit - this.indicesParaRemover.length);

                            foundNewBest = this.UpdateBest(novoMelhor);

                            this.indicesParaRemover = []; //limpa

                            this.findBestInThisTrial = foundNewBest;

                            var updatedIndexList = this.DoIndexes(this.bestIndividual);
                            nodesIndexList = updatedIndexList.slice();
                            updatedIndexes = updatedIndexList[this.typeIndexCounter];
                        }


                        this.typeIndexCounter++;
                        updatedIndexes = nodesIndexList[this.typeIndexCounter];
                        this._logger.Write(`[HC] Change index: ${updatedIndexes.Type}, ${updatedIndexes.Indexes.length}`);
                    }


                    this.executeCalculatedTimes(time, updatedIndexes, nodesIndexList, cb);
                });
            }

        });
    }

    /**
     * Executa várias exclusões de uma única vez
     * @param best Individuo
     * @param indices Indices dos nos para exclusao
     */
    private ExcluirTodosOsNos(best: Individual, indices: Object[]): Individual {
        return this._astExplorer.ExcluirListaDeNos(best, indices);
    }

    /**
    * Do N mutants per time
    */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: (mutants: Individual[], indexes: NodeIndex, done: boolean) => void) {
        let itsover: boolean = false;

        //Rest some mutant to process?
        if (counter < this._config.neighborsToProcess) {
            // its over actual index? (IF, CALL, etc)
            if (indexes.ActualIndex > indexes.Indexes.length - 1) {
                //Try change to next index
                //acabaram os vizinhos do indice!
                this._logger.Write(`[HC] All neighbors of ${indexes.Type} were visited`);

                // its over all index?
                //console.log(`[HC] this.typeIndexCounter: ${this.typeIndexCounter}`);
                //console.log(`[HC] indexes.Indexes.length: ${indexes.Indexes.length}`);

                if (this.typeIndexCounter >= nodesIndexList.length - 1) {
                    this._logger.Write(`[HC] All global neighbors were visited`);
                    itsover = true;
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
                this._logger.Write(`[HC] setInterval -> Neighbors ${neighbors.length}, Operations ${this.operationsCount}, typeIndexCounter ${this.typeIndexCounter}, nodesIndexList.length ${nodesIndexList.length}, indexes.ActualIndex ${indexes.ActualIndex}, indexes.Indexes.length ${indexes.Indexes.length}`);

                if (neighbors.length == this.operationsCount) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;

                    if (this.typeIndexCounter == (nodesIndexList.length - 1) && (indexes.ActualIndex > indexes.Indexes.length - 1)) {
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

}