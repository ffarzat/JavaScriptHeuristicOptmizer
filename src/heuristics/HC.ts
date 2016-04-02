import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';

/**
 * Hill Climbing Search for Code Improvement
 */
export default class HC extends IHeuristic {
    
    neighborApproach: string;
    restart: boolean;
    trialsToRestart: number;
    
    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration): void{
        super.Setup(config);
        
        this.neighborApproach = config.neighborApproach;
        this.restart = config.restart;
        this.trialsToRestart = config.trialsToRestart;
    }
   
    /**
     * Initializes all trials
     */
    RunTrials(){
        
        for (var index = 0; index < this.Trials; index++) {
            console.log("Runing HC!");
        }
    }
}