import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';

/**
 * Hill Climbing Search for Code Improvement
 */
export default class HC extends IHeuristic {
    
    /**
     * Initializes all trials
     */
    RunTrials(){
        
        for (var index = 0; index < this._config.trials; index++) {
            console.log("Runing HC!");
        }
    }
}