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
        this.operationsCounter = 0;
        this.totalCallBack = 0;
        this.ActualBestForFunctionScope = this.bestIndividual.Clone(); // Nesse momento o bestIndividual é o original
        this.ExecutarPorFuncao(trialIndex, cb);
    }


    /**
     * Surrogate para a runByFunction
     */
    private ExecutarPorFuncao(trialIndex: number, cb: (results: TrialResults) => void) {
        var funcaoAtual = this.RecuperarMelhorFuncaoAtual();

        if (funcaoAtual == undefined) {
            this._logger.Write(`[RD] Não há mais funções para otimizar!`);
            this.Stop();
            var results = this.ProcessResult(trialIndex, this.Original, this.ActualBestForFunctionScope);
            cb(results);
            return;
        }
        //Seta a fução atual
        this.ActualFunction = funcaoAtual;
        this._logger.Write(`[RD] Otimizando a função ${this.ActualFunction}!`);

        this.ExecutarMutacao(trialIndex, cb);
    }


    /**
    * Executa as mutações em sequencia
    */
    private ExecutarMutacao(trialIndex: number, cb: (results: TrialResults) => void) {

        process.nextTick(() => {
            this.operationsCounter++;

            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            context.nodesSelectionApproach = "ByFunction";
            context.ActualBestForFunctionScope = this.ActualBestForFunctionScope;
            
            this.Mutate(context, (mutant) => {
                this.totalCallBack++;
                //this._logger.Write(`[RD] this.totalCallBack: ${this.totalCallBack}`);
                try {
                    if (this.UpdateBest(mutant)) {
                        this.ActualBestForFunctionScope = this.bestIndividual;
                    }
                } catch (error) {
                    this._logger.Write(`[RD] Mutant error: ${error}`);
                }

                process.nextTick(()=>{
                    
                });


            });
        });

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