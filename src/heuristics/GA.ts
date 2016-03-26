import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';

/**
 * Genetic Algorithm for Code Improvement
 */
export default class GA implements IHeuristic {
    
    /**
     * Parse especific config for GA
     */
    Setup(config: IConfiguration): void{
      
    }
    
    /**
     * Initializes all trials
     */
    RunTrials(){
        
    }
    
    /**
     * Executes the unit Tests over GA's perspective
     */
    Test(tester: ITester){
        
    }
    
    
    /**
     * Notifies about results of all trials
     */
    Notify(){
        
    }
    
}