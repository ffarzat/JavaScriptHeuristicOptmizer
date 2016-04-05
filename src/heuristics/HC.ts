import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import Node from './Node';

var nodes = require('nodes');

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
        
        var program = nodes.build(original.AST);
        var nodesList: Node [] = [];
        
        if(this.restart)
            this._logger.Write(`HC will restart search after ${this.trialsToRestart} bad neighbors`);
        
        if(this.nodesType.length > 0){
            this.nodesType.forEach(element => {
                var total = program.search(element).length;
                var node = {"type": element, "count": total, "actualIndex": 0}
                this._logger.Write(`        ${element}: ${total}`);
                nodesList.push(node);
            });    
        }
        
        //var functions = program.search('#Function'); //all kind of Function Declarion [#FunctionExpression, #FunctionDeclaration and #ArrowFunctionExpression]
        //this._logger.Write(functions.length);
        
        var restartCount
        
        for (var index = 0; index < this.trials; index++) {
            
            //get neighbor
            
            //Testing
            
            //update best?
        }
        
        return;
    }
}