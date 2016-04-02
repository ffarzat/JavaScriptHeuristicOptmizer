import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
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
    Setup(config: IConfiguration): void{
        super.Setup(config);
        
        this.neighborApproach = config.trialConfiguration.neighborApproach;
        this.restart = config.trialConfiguration.restart;
        this.trialsToRestart = config.trialConfiguration.trialsToRestart;
    }
    
    
    /**
     * Initializes all trials
     */
    RunTrials(){
        
        for (var index = 0; index < this._config.trials; index++) {
            console.log("Runing HC!");
        }
    }
}