import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import OperatorContext from '../OperatorContext';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import Library from '../Library';

var exectimer = require("exectimer");

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
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {

    trials: number
    howManyTimes: number;

    intervalId;
    timeoutId;
    operationsCounter: number;
    totalCallBack: number;

    qtdMutantesAtuais: number;
    qtdMutacoesNaFuncaoAtual: number;

    //mutantesDaFuncao: Individual[];

    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {
        super.Setup(config, globalConfig, allHosts);

        this.trials = config.trials;
        //this.mutantesDaFuncao = []
    }


    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {

        this._logger.Write(`[RD] Starting  Random Search`);
        this._logger.Write(`[RD] Starting  Trial ${trialIndex} of ${this.Trials}`);

        this.SetLibrary(library, (sucess: boolean) => {
            if (sucess) {
                this.Start();

                var totalTrials = this.trials;
                this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
                this._logger.Write(`[RD] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);


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
     * Surrogate para executeCalculatedTimes
     */
    private runGlobal(trialIndex: number, cb: (results: TrialResults) => void) {
        this.executeCalculatedTimes(0, () => {
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
            cb(results);
            return;
        });
    }

    /**
    * Surrogate para execução da Otimização por função
    */
    private runByFunction(trialIndex: number, cb: (results: TrialResults) => void) {
        this.totalOperationsCounter = 0;
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original
        this.ExecutarPorFuncao(trialIndex, cb);

    }
    /**
     * Executa a verificação para trocar a função atual na otimização
     */
    TrocarFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();

        if (funcaoAtual == undefined || funcaoAtual == "undefined") {
            this._logger.Write(`[RD] Não há mais funções para otimizar!`);
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
            cb(results);
            return;
        }

        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        //this._logger.Write(`[RD] this.bestIndividual ${JSON.stringify(this.bestIndividual.AST)}`);
        //Conta e escolhe aleatoriamente quantas instruções causar mutação nessa função
        var rndNodes = this._astExplorer.CountNodes(this.bestIndividual);
        this._logger.Write(`[RD] ${this.ActualFunction} possui ${rndNodes} nós`);
        //var vizinhosAoMesmoTempo = (this._globalConfig.clientsTotal * 2);
        //rndNodes = rndNodes > vizinhosAoMesmoTempo ? vizinhosAoMesmoTempo : rndNodes;
        this.qtdMutacoesNaFuncaoAtual = this._astExplorer.GenereateRandom(1, rndNodes);
        this.qtdMutantesAtuais = 0;
        this._logger.Write(`[RD] Otimizando a função ${this.ActualFunction}. ${this.qtdMutacoesNaFuncaoAtual} instrução(ões) sofrerá(ão) mutação!`);
    }

    /**
     * Surrogate para a runByFunction
     */
    private ExecutarPorFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        this.TrocarFuncao(trialIndex, cb);
        this.ExecutarMutacao(0, trialIndex, cb);
    }

    //Executa uma mutação simples
    private ExecutarMutacao(time: number, trialIndex: number, cb: (results: TrialResults) => void) {
        //this._logger.Write(`[RD] Orçamento: ${this.trials - this.operationsCount}`);
        this.operationsCount = 0;
        this.neighbors = []

        process.nextTick(() => {
            this.ExecutarMutacoesConfiguradas(0, (mutants, finish) => {

                if (time == this.howManyTimes || finish) { //Done!
                    this.Stop();
                    var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
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
    private ExecutarMutacoesConfiguradas(counter: number, cb: (mutants: Individual[], done: boolean) => void) {
        let itsover: boolean = false;


        //Waiting to be done!
        if (!this.intervalId) {

            this.intervalId = setInterval(() => {
                this._logger.Write(`[RD] setInterval -> Neighbors ${this.neighbors.length}, Operations ${this.operationsCount}`);
                //, typeIndexCounter ${this.typeIndexCounter}, nodesIndexList.length ${nodesIndexList.length}, indexes.ActualIndex ${indexes.ActualIndex}, indexes.Indexes.length ${indexes.Indexes.length}`);

                if (this.neighbors.length >= this.operationsCount) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;

                    //Acabou a farra
                    if (this.totalOperationsCounter >= this.trials) {
                        this._logger.Write(`[RD] Orçamento total de rodadas consumido [${this.trials}] `);
                        cb(this.neighbors, true);
                    }
                    else {

                        //trocar de função ou continuar?
                        this._logger.Write(`[RD] setInterval -> this.qtdMutacoesNaFuncaoAtual ${this.qtdMutacoesNaFuncaoAtual}, this.qtdMutantesAtuais ${this.qtdMutantesAtuais}`);
                        if (this.qtdMutacoesNaFuncaoAtual > this.qtdMutantesAtuais) {
                            //salva os mutantes
                            for (var n = 0; n < this.neighbors.length; n++) {

                                this.UpdateBest(this.neighbors[n].Clone());
                            }

                            //Recomeça por que a função ainda tem vizinhos aleatórios
                            this.operationsCount = 0;
                            this.neighbors = []

                            //this._logger.Write(`[RD] this.mutantesDaFuncao [${this.neighbors.length}] `);
                            this._logger.Write(`[RD] this.neighbors [${this.neighbors.length}] `);

                            this.ExecutarMutacoesConfiguradas(0, cb);
                        }
                        else {
                            this._logger.Write(`[RD] Tentando avançar para próxima função...`);
                            cb(this.neighbors, false);
                        }
                    }
                    return;

                }
            }, 1 * 1000); //each ten secs
        }

        if (this.totalOperationsCounter >= this.trials) {
            this._logger.Write(`[RD] Orçamento Esgotado ${this.trials}. Aguardando`);
            return;
        }
        else {
            this._logger.Write(`[RD] Orçamento atual ${this.trials - this.totalOperationsCounter}`);
            //this._logger.Write(`[RD] vizinho ${counter}`);
        }

        if (this.qtdMutacoesNaFuncaoAtual == this.qtdMutantesAtuais) {
            this._logger.Write(`[RD] Esgotado o orçamento aleatório [${this.qtdMutacoesNaFuncaoAtual}] da função ${this.ActualFunction}! Aguardando...`);
            itsover = true;
        }

        //Rest some mutant to process?
        if (counter < this._config.neighborsToProcess) {

            //All neighbors were visited?
            if (!itsover) {
                this.totalOperationsCounter++;
                this.qtdMutantesAtuais++;
                //Entra a AST da Função atual sendo otimizada
                var context: OperatorContext = new OperatorContext();
                context.First = this.bestIndividual.Clone();

                this.operationsCounter++;

                this.Mutate(context, (mutant) => {
                    //this._logger.Write(`[RD] Voltando... neighbors: ${this.neighbors.length} `);
                    try {
                        //Volta um mutante completo e testado
                        this.neighbors.push(mutant);
                    }
                    catch (error) {
                        this._logger.Write(`[RD] MutateBy error: ${error} `);
                        this.neighbors.push(this.Original.Clone());
                    }

                    ///this._logger.Write(`[RD] Voltando... neighbors: ${this.neighbors.length} `);

                });

                counter++;
                this.operationsCount = counter;
                process.nextTick(() => {
                    this.ExecutarMutacoesConfiguradas(counter++, cb);
                });
            }
        }
    }
    /**
     * How many time to execute DoMutationsPerTime
     */
    private executeCalculatedTimes(time: number, cb: () => void) {

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        if (time == 0) {
            var result = UglifyJS.minify(this.bestIndividual.ToCode(), uglifyOptions);
            this.bestIndividual.modificationLog.push(`0;original;${result.code.length}`);

            var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "RD");
            var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
            var logString = this.bestIndividual.modificationLog[this.bestIndividual.modificationLog.length - 1];
            fs.appendFileSync(file, `counter;index;instructionType;totalChars \n`);
            fs.appendFileSync(file, `${time};${logString} \n`);
        }


        this.DoMutationsPerTime(1, [], (mutants) => {

            time++;

            this._logger.Write(`[RD] internal trial: ${time}/${this.howManyTimes} done.`);
            //this._logger.Write(`[RD]mutants: ${mutants.length}`);


            mutants.forEach(element => {
                var isBetter = this.UpdateBest(element);
                if (isBetter) {
                    //Save modifications log
                    var directory = path.join(this._globalConfig.resultsDirectory, this._lib.name, "RD");
                    var file = path.join(directory, this.ActualGlobalTrial + "_modifications.csv");
                    var logString = element.modificationLog[element.modificationLog.length - 1];
                    fs.appendFileSync(file, `${time};${logString} \n`);
                }
            });


            if (time == this.howManyTimes) { //Done!
                cb();
            } else {

                process.nextTick(() => {
                    this.executeCalculatedTimes(time, cb);
                });
            }

        });
    }

    /**
     * Do N mutants per time
     */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], cb: (mutants: Individual[]) => void) {




        if (counter == this._config.neighborsToProcess) {
            this._logger.Write(`[RD] Done requests. Just waiting`);

            //this._logger.Write(`[RD] ${this.intervalId == undefined}`);
            if (this.intervalId == undefined) {
                var start = new Date();

                this.intervalId = setInterval(() => {
                    this._logger.Write(`[RD] Mutations total: ${this.totalCallBack}/${this.operationsCounter}`);

                    if (this.totalCallBack == this.operationsCounter) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(neighbors);
                    }
                }, 1 * 1000);
            }

            return;
        } else {

            //this._logger.Write(`[RD] Asking  mutant ${counter}`);
            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            this.operationsCounter++;

            this.Mutate(context, (mutant) => {
                try {
                    this.totalCallBack++;

                    neighbors.push(mutant);
                    this._logger.Write(`[RD] Mutant done: ${neighbors.length}`);
                } catch (error) {
                    this._logger.Write(`[RD] Mutant error: ${error}`);
                    neighbors.push(this.bestIndividual.Clone());
                    this._logger.Write(`[RD] Mutant done: ${neighbors.length}`);
                }
            });

            counter++;

            process.nextTick(() => {
                this.DoMutationsPerTime(counter, neighbors, cb);
            });
        }
    }

}