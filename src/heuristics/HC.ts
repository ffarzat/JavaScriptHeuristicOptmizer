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

    howManyTimes: number;

    intervalId;
    typeIndexCounter: number;

    ramdonRestart: boolean;
    restartAtEnd: boolean;
    ramdonNodes: boolean;

    restartCounter: number;
    findBestInThisTrial: boolean;


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
     * Executa o HC sob a perspectiva de função
     */
    runByFunction(trialIndex: number, cb: (results: TrialResults) => void): void {
        this.totalOperationsCounter = 0;
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original
        this.ExecutarPorFuncao(trialIndex, cb);
    }


    TrocarFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();

        if (funcaoAtual == undefined || funcaoAtual == "undefined" || this.bestIndividual == undefined) {
            this._logger.Write(`[HC] Não há mais funções para otimizar!`);
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
            cb(results);
            return;
        }
        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        this._logger.Write(`[HC] Otimizando a função ${this.ActualFunction}!`);
    }

    /**
     * Surrogate para a runByFunction
     */
    private ExecutarPorFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        this.TrocarFuncao(trialIndex, cb);



        //Array com todos os indices de nó
        let nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual.Clone());
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

        this.neighbors = []

        process.nextTick(() => {
            this.ExecutarMutacoesConfiguradas(0, indexes, nodesIndexList, (mutants, updatedIndexes, finish) => {

                if (time == this.howManyTimes || finish) { //Done!
                    this.Stop();
                    var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
                    cb(results);
                    return;
                } else {

                    for (var z = 0; z < mutants.length; z++) {
                        var element = mutants[z];
                        this.UpdateBest(element);
                    }

                    this.ExecutarPorFuncao(trialIndex, cb); //recursivo
                }

            });
        });
    }

    /**
    * Do N mutants per time
    */
    private ExecutarMutacoesConfiguradas(counter: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: (mutants: Individual[], indexes: NodeIndex, done: boolean) => void) {
        let itsover: boolean = false;


        //Waiting to be done!
        if (!this.intervalId) {

            this.intervalId = setInterval(() => {
                this._logger.Write(`[HC] setInterval -> Neighbors ${this.neighbors.length}, Operations ${this.operationsCount}`);
                //, typeIndexCounter ${this.typeIndexCounter}, nodesIndexList.length ${nodesIndexList.length}, indexes.ActualIndex ${indexes.ActualIndex}, indexes.Indexes.length ${indexes.Indexes.length}`);

                if (this.neighbors.length >= this.operationsCount) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;

                    //Acabou a farra
                    if (this.totalOperationsCounter >= this.trials) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(this.neighbors, indexes, true);
                    }

                    if (this.typeIndexCounter == (nodesIndexList.length - 1) && (indexes.ActualIndex == indexes.Indexes.length - 1)) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(this.neighbors, indexes, true);
                    }
                    else {
                        cb(this.neighbors, indexes, false);
                    }
                }
            }, 1 * 1000); //each ten secs
        }

        if (this.totalOperationsCounter >= this.trials) {
            this._logger.Write(`[HC] Orçamento Esgotado ${this.trials}. Aguardando`);
            return;
        }
        else {
            this._logger.Write(`[HC] Orçamento atual ${this.trials - this.totalOperationsCounter}`);
            //this._logger.Write(`[HC] vizinho ${counter}`);
        }

        //Rest some mutant to process?
        if (counter < this._config.neighborsToProcess) {
            // its over actual index? (IF, CALL, etc)
            if (indexes.Indexes[indexes.ActualIndex] == undefined) {
                //acabou? Tenta o próximo
                this.typeIndexCounter++;
                indexes = nodesIndexList[this.typeIndexCounter];
                this._logger.Write(`[HC] Tentando mudar de indice [${this.typeIndexCounter}]`);

                if (indexes == undefined || indexes.Indexes.length == 0) {
                    this._logger.Write(`[HC] Todos os vizinhos foram visitados. Aguardando.`);
                    return;
                }
            }

            //All neighbors were visited?
            if (!itsover) {
                this.totalOperationsCounter++;
                //Entra a AST da Função atual sendo otimizada
                this.MutateBy(this.bestIndividual.Clone(), indexes, (mutant) => {
                    //this._logger.Write(`[HC] Voltando... neighbors: ${this.neighbors.length} `);
                    try {
                        //Volta um mutante completo e testado
                        this.neighbors.push(mutant);
                    }
                    catch (error) {
                        this._logger.Write(`[HC] MutateBy error: ${error} `);
                        this.neighbors.push(this.Original.Clone());
                    }

                    ///this._logger.Write(`[HC] Voltando... neighbors: ${this.neighbors.length} `);

                });

                counter++;
                this.operationsCount = counter;
                process.nextTick(() => {
                    this.ExecutarMutacoesConfiguradas(counter++, indexes, nodesIndexList, cb);
                });
            }

        }
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


            var BreakException = {};
            try {
                mutants.forEach(element => {
                    foundNewBest = this.UpdateBest(element);


                    var constante_quantas_voltar = this._config.neighborsToProcess;

                    if (foundNewBest && this.neighborApproach === 'FirstAscent') {
                        this.findBestInThisTrial = foundNewBest;
                        //Jump to first best founded
                        var updatedIndexList = this.DoIndexes(this.bestIndividual);
                        nodesIndexList = updatedIndexList.slice();
                        updatedIndexes = updatedIndexList[this.typeIndexCounter];
                        if (updatedIndexes == undefined)
                            cb(time);
                        updatedIndexes.ActualIndex = (indexes.ActualIndex - constante_quantas_voltar) < 0 ? 0 : (indexes.ActualIndex - constante_quantas_voltar); //continua de onde parou (-2??)
                        throw BreakException;
                    }

                    if (foundNewBest && this.neighborApproach === 'LastAscent') {
                        this.findBestInThisTrial = foundNewBest;
                        //Jump to best of all
                        var updatedIndexList = this.DoIndexes(this.bestIndividual);
                        nodesIndexList = updatedIndexList.slice();
                        updatedIndexes = updatedIndexList[this.typeIndexCounter];
                        if (updatedIndexes == undefined)
                            cb(time);
                        updatedIndexes.ActualIndex = (indexes.ActualIndex - constante_quantas_voltar) < 0 ? 0 : (indexes.ActualIndex - constante_quantas_voltar); //continua de onde parou
                    }

                });
            } catch (error) {
                //Se não foi o break, sobe o erro
                if (error !== BreakException) throw error;
                this._logger.Write('First Ascent');
                //force 
                finish = false;
                mudarIndiceQuandoEncontraMelhor = false;
            }

            if (time == this.howManyTimes || finish) { //Done!
                cb(time);
            } else {
                process.nextTick(() => {

                    //change node index?
                    if (indexes.ActualIndex > indexes.Indexes.length - 1 && (this.typeIndexCounter < nodesIndexList.length - 1) && mudarIndiceQuandoEncontraMelhor) {
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