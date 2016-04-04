import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';

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
        
        
        
        for (var index = 0; index < this.trials; index++) {
            console.log("Runing HC!");
        }
        
        return;
    }
    
    /**
     * Creates a List with
     */
    CreateNodesIteratorList(): number {
        
        
        
        return;
    }
    
}