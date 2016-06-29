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

    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {
        super.Setup(config, globalConfig);

        this.trials = config.trials;
    }


    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {

        this._logger.Write(`[RD] Starting  Random Search`);
        this._logger.Write(`[RD] Starting  Trial ${trialIndex} of ${this.Trials}`);
        
        this.howManyTimes = Math.floor((this.trials % this._config.neighborsToProcess) + (this.trials / this._config.neighborsToProcess)); // force interger

        this._logger.Write(`[RD] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);

        this.SetLibrary(library, () => {
            this.Start();
            this.executeCalculatedTimes(0, () => {
                this.Stop();
                this.runGC();
                var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
                cb(results);
                return;
            });
        });

    }

    /**
     * How many time to execute DoMutationsPerTime
     */
    private executeCalculatedTimes(time: number, cb: () => void) {

        this.operationsCounter = 0;

        this.DoMutationsPerTime(0, [], (mutants) => {

            time++;

            this._logger.Write(`[RD] internal trial: ${time}/${this.howManyTimes}`);
            //this._logger.Write(`[RD]mutants: ${mutants.length}`);
            

            mutants.forEach(element => {
                this.UpdateBest(element);
            });


            if (time == this.howManyTimes) { //Done!
                cb();
            } else {

                setTimeout(() => {
                    this.executeCalculatedTimes(time, cb);
                }, 0);
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
                    this._logger.Write(`[RD] Mutations total: ${neighbors.length}/${this.operationsCounter}`);

                    if (neighbors.length == this.operationsCounter) {
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
                neighbors.push(mutant);

                //this._logger.Write(`[RD] Mutant done: ${neighbors.length}`);
            });

            counter++;

            setTimeout(() => {
                this.DoMutationsPerTime(counter, neighbors, cb);
            }, 50);
        }
    }

}