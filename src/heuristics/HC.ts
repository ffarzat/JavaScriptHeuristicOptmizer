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
    public async RunTrial(trialIndex: number): Promise<TrialResults>{
        this._logger.Write(`Starting  Trial ${trialIndex}`);
        this._logger.Write(`Initializing HC ${this.neighborApproach}`);
        this._logger.Write(`Using nodesType: ${this.nodesType}`);
               
        if(this.restart)
            this._logger.Write(`HC will restart search after ${this.trialsToRestart} bad neighbors`);
        
        var nodesIndexList: NodeIndex [] = this.DoIndexes(this.Original);
        
        var counterToRestart = 0;
        var typeIndexCounter = 0;
        var indexes: NodeIndex = nodesIndexList[typeIndexCounter];
        
        for (var index = 0; index < this.trials; index++) {//for trials

            //get next neighbor by typeIndex.ActualIndex
            var neighbor: Individual = this.MutateBy(this.bestIndividual, indexes);
            
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

                //totally randon    
                if(counterToRestart == this.trialsToRestart) { 
                    typeIndexCounter = this.GenereateRandom(0, nodesIndexList.length);
                    this._logger.Write(`HC Restarting`);
                    this.emit('Restart');
                }
            }
            
            //Next NodeIndex?
            if(indexes.ActualIndex == indexes.Indexes.length -1) {
                typeIndexCounter++;
                
                if(typeIndexCounter <= nodesIndexList.length -1)
                    indexes = nodesIndexList[typeIndexCounter];
            }
        }
        
        return this.ProcessResult(trialIndex, this.Original, this.bestIndividual);;
    }
    
    /**
     * Populates the indexes for NodeType inside Code
     */
    private DoIndexes(original: Individual): NodeIndex [] {
        var nodesIndexList: NodeIndex [] = [];
        
        if(this.nodesType.length > 0){
            this.nodesType.forEach(element => {
                var nodeIndex = this.IndexBy(element, original);
                nodesIndexList.push(nodeIndex);
                this._logger.Write(`${element}: ${nodeIndex.Indexes.length}`);
            });    
        }
        else{
            this._logger.Write(`FATAL: There is no configuration for NodeType for HC Optmization`);
            throw "There is no configuration for NodeType for HC Optmization";
        }
        
        return nodesIndexList;
    }
    
}