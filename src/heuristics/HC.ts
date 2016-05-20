/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import NodeIndex from './NodeIndex';


//[FunctionExpression, FunctionDeclaration and ArrowFunctionExpression]

/**
 * Hill Climbing Search for Code Improvement
 */
export default class HC extends IHeuristic {

    neighborApproach: string;
    trials: number
    nodesType: string[];

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
    public async RunTrial(trialIndex: number): Promise<TrialResults> {
        this._logger.Write(`Starting  Trial ${trialIndex}`);
        this._logger.Write(`Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`Using nodesType: ${this.nodesType}`);

        var nodesIndexList: NodeIndex[] = this.DoIndexes(this.Original);

        var typeIndexCounter = 0;
        var indexes: NodeIndex = nodesIndexList[typeIndexCounter];
        var neighborPromises = [];
        var totalTrials = this.trials;
        var howMany = (totalTrials % this._config.neighborsToProcess) + (totalTrials / this._config.neighborsToProcess);
        this._logger.Write(`HC will run ${howMany} client calls`);

        for (var index = 0; index < howMany; index++) {//for trials
            for (var insideIndex = 0; insideIndex < this._config.neighborsToProcess; insideIndex++) {
                //this._logger.Write(`Mutant: [${index}, ${insideIndex}]`);
                
                //get next neighbor by typeIndex.ActualIndex
                neighborPromises.push(this.MutateBy(this.bestIndividual, indexes));

                //Next NodeIndex?
                if (indexes.ActualIndex == indexes.Indexes.length - 1) {
                    typeIndexCounter++;

                    if (typeIndexCounter <= nodesIndexList.length - 1)
                        indexes = nodesIndexList[typeIndexCounter];
                }
            }
        }

        var neighbors = await Promise.all(neighborPromises);
        this._logger.Write(`neighbors: ${neighbors.length}`);

        neighbors.forEach(element => {
            this.UpdateBest(element);
        });

        var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);

        return new Promise<TrialResults>((resolve, reject) => {
            resolve(results);
        });
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