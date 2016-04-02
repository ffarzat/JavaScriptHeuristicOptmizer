import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';

/**
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {
    
    /**
     * Initializes all trials
     */
    RunTrials(){
        
        for (var index = 0; index < this.Trials; index++) {
            console.log("Runing RD!");
            
        }
        
    }
    
}