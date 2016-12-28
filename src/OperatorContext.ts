
import Library from './Library';
import Individual from './Individual';

 /**
 * OperatorContext
 */
export default class OperatorContext {
    
    /**
     * Options ['Mutation', 'CrossOver', 'Testing']
     */
    Operation: string 
    
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
     * Original Lib Individual
     */
    Original: Individual;
    
    /**
     * Do mutation until...
     */
    MutationTrials: number;
    
    /**
     * Do CrossOver until...
     */
    CrossOverTrials: number;
    
    /**
     * For mutation by node index
     */
    NodeIndex: number;

    /**
     * Amount of Available meomry to use for testing
     */
    MemoryToUse: number;
}