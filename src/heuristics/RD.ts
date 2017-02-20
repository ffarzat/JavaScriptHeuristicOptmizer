import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import OperatorContext from '../OperatorContext';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import Library from '../Library';

var exectimer = require("exectimer");

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
    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {
        super.Setup(config, globalConfig, allHosts);

        this.trials = config.trials;
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
        this.qtdMutantesAtuais = 0;
        this.operationsCounter = 0;
        this.totalCallBack = 0;
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original

        this.ExecutarParaCadaFuncao(() => {
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
            cb(results);
            return;
        });

    }

    /**
     * Para cada função na lista e enquando houver orçamento
     */
    private ExecutarParaCadaFuncao(cb: () => void) {
        var orcamento = (this.trials - this.qtdMutantesAtuais);
        //this._logger.Write(`[RD] Orçamento restante ${orcamento}`);

        if (orcamento <= 0) {
            this._logger.Write(`[RD] Não há mais orçamento de rodadas!`);
            cb();
            return;
        }

        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();
        if (funcaoAtual == undefined || funcaoAtual == "undefined") {
            this._logger.Write(`[RD] Não há mais funções para otimizar!`);
            cb();
            return;
        }

        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        this._logger.Write(`[RD] Otimizando a função ${this.ActualFunction}!`);
        //Decide quantas instruções (e não quais) sroferão mutação (entre 0 e o total dessa função)
        this.qtdMutacoesNaFuncaoAtual = this._astExplorer.GenereateRandom(0, this._astExplorer.CountNodes(this.bestIndividual));
        this._logger.Write(`[RD] Serão executadas ${this.qtdMutacoesNaFuncaoAtual} nessa função`);
        //Zera os contadores
        this.operationsCounter = 0;
        this.totalCallBack = 0;
        //Executar qtdMutacoesNaFuncaoAtual enquanto houver orçamento
        this.ExecutarMutacoesPorFuncaoComLimite([], (mutantes) => {

            //this._logger.Write(`[RD] deveria ter acabado de processar os vizinhos de uma função: ${mutantes.length}`);

            if (this.functionStack.length > 0) {
                process.nextTick(() => {
                    //Incrementa a função
                    this.ExecutarParaCadaFuncao(cb);
                });
            }
        });
    }

    /**
     * Executa as mutações para uma determinada função. Encerra quando o orçamento de rodadas acaba ou quando concluí as mutações da função
     */
    private ExecutarMutacoesPorFuncaoComLimite(mutantesAtuais: Individual[], cb: (mutantes: Individual[]) => void) {

        //Zera os contadores da DoMutationsPerTime
        this.operationsCounter = 0;
        this.totalCallBack = 0;

        this.ExecutarMutacoesPorVez(0, [], (mutantesProcessados) => {

            mutantesProcessados.forEach(element => {
                this.UpdateBest(element);

                mutantesAtuais.push(element);
            });

            this._logger.Write(`[RD] mutantes atuais: ${mutantesAtuais.length}`);
            this.qtdMutantesAtuais = (this.qtdMutantesAtuais + mutantesProcessados.length);

            //Bateu no total de execuções paralelas?
            //TODO:Verificar por igualdade. Aqui está rolando uma perda por função

            var orcamento = (this.trials - this.qtdMutantesAtuais);
            this._logger.Write(`[RD] Orçamento restante ${orcamento}`);

            if (mutantesAtuais.length > this.qtdMutacoesNaFuncaoAtual || orcamento <= 0) {
                cb(mutantesProcessados);
                return;
            }

            process.nextTick(() => {
                this.ExecutarMutacoesPorFuncaoComLimite(mutantesAtuais, cb);
            });

        })
    }

    /**
     * Executa as X mutações por vez. Usa a configuração neighborsToProcess 
     */
    ExecutarMutacoesPorVez(contadorLocal: number, vizinhos: Individual[], cb: (mutantes: Individual[]) => void) {

        if (contadorLocal == this._config.neighborsToProcess) {
            this._logger.Write(`[RD] Done requests. Just waiting`);

            //this._logger.Write(`[RD] ${this.intervalId == undefined}`);
            if (this.intervalId == undefined) {
                var start = new Date();

                this.intervalId = setInterval(() => {
                    this._logger.Write(`[RD] Mutations total: ${this.totalCallBack}/${this.operationsCounter}`);

                    if (this.totalCallBack == this.operationsCounter) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(vizinhos);
                    }
                }, 1 * 1000);
            }

            return;
        }

        //Contador local/global
        this.operationsCounter++;

        var context: OperatorContext = new OperatorContext();
        context.First = this.bestIndividual.Clone();
        context.ActualBestForFunctionScope = this.ActualBestForFunctionScope;
        context.functionName = this.ActualFunction;

        this.Mutate(context, (mutant) => {
            try {
                this.totalCallBack++;
                vizinhos.push(mutant);
                this._logger.Write(`[RD] Mutant done: ${vizinhos.length}`);
            } catch (error) {
                this._logger.Write(`[RD] Mutant error: ${error}`);
                vizinhos.push(this.bestIndividual.Clone());
                this._logger.Write(`[RD] Mutant done: ${vizinhos.length}`);
            }
        });

        contadorLocal++;

        process.nextTick(() => {
            this.DoMutationsPerTime(contadorLocal, vizinhos, cb);
        });


    }

    /**
     * Espera as requisições terminarem
     */
    EsperarRequisicoes() {
        this._logger.Write(`[RD] Esperando...`);
    }

    /**
     * How many time to execute DoMutationsPerTime
     */
    private executeCalculatedTimes(time: number, cb: () => void) {

        this.operationsCounter = 0;
        this.totalCallBack = 0;

        this.DoMutationsPerTime(1, [], (mutants) => {

            time++;

            this._logger.Write(`[RD] internal trial: ${time}/${this.howManyTimes} done.`);
            //this._logger.Write(`[RD]mutants: ${mutants.length}`);


            mutants.forEach(element => {
                this.UpdateBest(element);
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