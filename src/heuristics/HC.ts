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

    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {

        super.Setup(config, globalConfig);

        this.neighborApproach = config.neighborApproach;
        this.trials = config.trials;
        this.nodesType = config.nodesType;
    }

    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this._logger.Write(`Starting  Trial ${trialIndex}`);
        this._logger.Write(`Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`Using nodesType: ${this.nodesType}`);


        this.SetLibrary(library, () => {
            var nodesIndexList: NodeIndex[] = this.DoIndexes(this.bestIndividual);
            var typeIndexCounter = 0;
            var indexes: NodeIndex = nodesIndexList[typeIndexCounter];
            var totalTrials = this.trials;
            this.howManyTimes = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
            this._logger.Write(`HC will run ${this.howManyTimes} times for ${this._config.neighborsToProcess} client calls`);

            this.executeCalculatedTimes(0, indexes, nodesIndexList, typeIndexCounter, () => {
                var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
                cb(results);
            });

        });
    }

    /**
     * How many time to execute DoMutationsPerTime
     */
    private executeCalculatedTimes(time: number, indexes: NodeIndex, nodesIndexList: NodeIndex[], typeIndexCounter: number, cb: () => void) {

        this.DoMutationsPerTime(0, [], indexes, nodesIndexList, typeIndexCounter, (mutants, finish) => {
            this._logger.Write(`[HC]How Many: ${time}`);
            var foundNewBest = false;
            
            time++;
            
            mutants.forEach(element => {
                foundNewBest = this.UpdateBest(element);

                if (foundNewBest && this.neighborApproach === 'FirstAscent') {
                    //Jump to first best founded
                    nodesIndexList = this.DoIndexes(this.bestIndividual);
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
                this.executeCalculatedTimes(time, indexes, nodesIndexList, typeIndexCounter, cb);
            }

        });
    }

    /**
     * Do N mutants per time
     */
    private DoMutationsPerTime(counter: number, neighbors: Individual[], indexes: NodeIndex, nodesIndexList: NodeIndex[], typeIndexCounter: number, cb: (mutants: Individual[], done: boolean) => void) {

        if (counter == this._config.neighborsToProcess) {
            if (neighbors.length == counter) {
                cb(neighbors, false);
            }
            else {
                setTimeout(() => {
                    this.DoMutationsPerTime(counter, neighbors, indexes, nodesIndexList, typeIndexCounter, cb); //No increment    
                }, 60 * 1000);
            }
        } else {

            this.MutateBy(this.bestIndividual.Clone(), indexes, (mutant) => {
                neighbors.push(mutant);
                
            });

            //Next NodeIndex?
            if (indexes.ActualIndex == indexes.Indexes.length - 1) {
                typeIndexCounter++;
                this._logger.Write(`[HC]Index Counter: ${typeIndexCounter}`);

                if (typeIndexCounter <= nodesIndexList.length - 1) {
                    indexes = nodesIndexList[typeIndexCounter];
                } else {
                    this._logger.Write(`All neighbors were visited`);
                    cb(neighbors, true);
                }
            }

            counter++;
            this.DoMutationsPerTime(counter, neighbors, indexes, nodesIndexList, typeIndexCounter, cb);
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
            this._logger.Write(`FATAL: There is no configuration for NodeType for HC Optmization`);
            throw "There is no configuration for NodeType for HC Optmization";
        }

        return nodesIndexList;
    }

}