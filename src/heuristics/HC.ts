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

    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {

        super.Setup(config, globalConfig);

        this.neighborApproach = config.neighborApproach;
        this.trials = config.trials;
        this.nodesType = config.nodesType;
        this.typeIndexCounter = 0;
    }

    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this.Start();
        this._logger.Write(`[HC] Starting  Trial ${trialIndex}`);
        this._logger.Write(`[HC] Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`[HC] Using nodesType: ${this.nodesType}`);


        this.SetLibrary(library, () => {
            var nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual);
            var indexes: NodeIndex = nodesIndexList[0];
            var totalTrials = this.trials;
            this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
            this._logger.Write(`[HC] It will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);
            this._logger.Write(`[HC] Initial index: ${indexes.Type}`);

            this.executeCalculatedTimes(0, indexes, nodesIndexList, () => {
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
    private executeCalculatedTimes(time: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], cb: () => void) {

        this.operationsCount = 0;

        this.DoMutationsPerTime(0, [], indexes, nodesIndexList, (mutants, updatedIndexes, finish) => {
            //this._logger.Write(`[HC]How Many: ${time}`);
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
                setTimeout(()=> {
                    this.executeCalculatedTimes(time, updatedIndexes, nodesIndexList, cb);
                }, 0);
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
                setTimeout(()=> {
                    this.DoMutationsPerTime(counter++, neighbors, indexes, nodesIndexList, cb);
                }, 0);
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

                    if (this.typeIndexCounter == (nodesIndexList.length -1) && (indexes.ActualIndex == indexes.Indexes.length - 1)) {
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        cb(neighbors, indexes, true);
                    }
                    else {
                        cb(neighbors, indexes, false);
                    }
                }
            }, 10 * 1000); //each ten secs
        }
    }

    /**
     * Populates the indexes for NodeType inside Code
     */
    private DoIndexes(original: Individual): NodeIndex[] {
        var nodesIndexList: NodeIndex[] = [];

        if (this.nodesType.length > 0) {
            this.nodesType.forEach(element => {
                var nodeIndex = this.IndexBy(element, original);
                nodesIndexList.push(nodeIndex);
                this._logger.Write(`${element}: ${nodeIndex.Indexes.length}`);
            });
        }
        else {
            this._logger.Write(`[HC] FATAL: There is no configuration for NodeType for HC Optmization`);
            throw "[HC] There is no configuration for NodeType for HC Optmization";
        }

        return nodesIndexList;
    }

}