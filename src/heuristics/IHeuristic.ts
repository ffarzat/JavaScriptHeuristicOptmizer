import IConfiguration from '../IConfiguration';
import ITester from '../ITester';

/**
 * Generic interface for Heuristics 
 */
interface IHeuristic
{
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: IConfiguration): void;
    
    RunTrials();
    
    Test(tester: ITester);
    
    Notify();
}

export default IHeuristic;