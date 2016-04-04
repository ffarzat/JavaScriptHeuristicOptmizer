import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';

/**
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {
    
    /**
     * Run the trial
     */
    RunTrial(trialIndex: number, original: Individual): TrialResults{
        
        for (var index = 0; index < this.Trials; index++) {
            console.log("Runing RD!");
            
        }
        
        return;
    }
    
}