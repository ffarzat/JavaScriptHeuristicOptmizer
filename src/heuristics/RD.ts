import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import OperatorContext from '../OperatorContext';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import Library from '../Library';

/**
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {

    trials: number
    howManyTimes: number;

    intervalId;
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
        
        this.Start();

        this._logger.Write(`[RD] Starting  Random Search`);
        this._logger.Write(`[RD] Starting  Trial ${trialIndex} of ${this.Trials}`);


        var totalTrials = this.trials;
        this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);

        this._logger.Write(`[RD] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);

        this.SetLibrary(library, () => {
            this.executeCalculatedTimes(0, () => {
                this.Stop();
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

            //this._logger.Write(`[RD]How Many: ${time}`);

            mutants.forEach(element => {
                this.UpdateBest(element);
            });


            if (time == this.howManyTimes) { //Done!
                cb();
            } else {

                this.executeCalculatedTimes(time, cb);
            }

        });
    }

    /**
     * Do N mutants per time
     */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], cb: (mutants: Individual[]) => void) {

        if (counter == this._config.neighborsToProcess) {
            if (neighbors.length == counter + 1) {
                cb(neighbors);
            }
        } else {

            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            this.operationsCounter++;
            this.Mutate(context, (mutant) => {
                neighbors.push(mutant);
                
                this._logger.Write(`[RD] Mutant done: ${neighbors.length}`);
            });

            counter++;
            this.DoMutationsPerTime(counter, neighbors, cb);
        }


        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                //this._logger.Write(`[RD] Interval: Neighbors:${neighbors.length}, Operations ${this.operationsCounter}`);
                if (neighbors.length == this.operationsCounter) {
                    clearInterval(this.intervalId);
                    this.intervalId = undefined;
                    cb(neighbors);
                }
            }, 10 * 1000);
        }
    }

}