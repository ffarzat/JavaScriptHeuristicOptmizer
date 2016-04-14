
import Library from './Library';
import Individual from './Individual';

 /**
 * OperatorContext
 */
export default class OperatorContext {
    
    /**
     * Lib over tests/optmization
     */
    LibrarieOverTest: Library;
    
    /**
     * Top Fit Value for tLib over test [equals to original fit avg]
     */
    FitnessTopValue:number;
    
    /**
     * First Individual to process
     */
    First: Individual;
    
    /**
     * Second Individual to process
     */
    Second: Individual;
    
    /**
     * Do mutation until...
     */
    MutationTrials: number;
    
    /**
     * Do CrossOver until...
     */
    CrossOverTrials: number;
}