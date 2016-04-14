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
    restart: boolean;
    trialsToRestart: number;
    trials: number
    nodesType: string [];
    
    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration): void{
        super.Setup(config);
        
        this.neighborApproach = config.neighborApproach;
        this.restart = config.restart;
        this.trialsToRestart = config.trialsToRestart;
        this.trials = config.trials;
        this.nodesType = config.nodesType;
    }
   
    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, original: Individual): TrialResults{
        this._logger.Write(`Initializing HC ${this.neighborApproach}`);
        
        
        var nodesIndexList: NodeIndex [] = [];
        
        if(this.restart)
            this._logger.Write(`HC will restart search after ${this.trialsToRestart} bad neighbors`);
        
        if(this.nodesType.length > 0){
            this.nodesType.forEach(element => {
                var nodeIndex = this.IndexBy(element, original);
                nodesIndexList.push(nodeIndex);
                this._logger.Write(`        ${element}: ${nodeIndex.Indexes.length}`);
            });    
        }
        
        var counterToRestart = 0;
        
        for (var index = 0; index < this.trials; index++) {//for trials
            
            for (var typeIndexCounter = 0; typeIndexCounter < nodesIndexList.length; typeIndexCounter++) { //for node type
                var typeIndex = nodesIndexList[typeIndexCounter];
                
                //get next neighbor by typeIndex.ActualIndex
                var neighbor: Individual = this.MutateBy(this.bestIndividual, typeIndex.Type, typeIndex.Indexes[typeIndex.ActualIndex]) //refactoring
                typeIndex.ActualIndex++;
                
                //Testing
                this.Test(neighbor);
                
                //update best?
                this.UpdateBest(neighbor);
                
                //Restart?
                if(this.restart)
                {
                    if(neighbor.AST != this.bestIndividual.AST){
                        counterToRestart++;
                    }
                    else{
                        counterToRestart = 0;
                    }
                        
                    if(counterToRestart == this.trialsToRestart) //totally randon 
                        typeIndexCounter = this.GenereateRandom(0, nodesIndexList.length);
                }
            }
        }
        
        return this.ProcessResult(index, original, this.bestIndividual);;
    }
    
    
}