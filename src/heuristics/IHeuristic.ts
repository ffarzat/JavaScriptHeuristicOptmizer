import IConfiguration from '../IConfiguration';

/**
 * Generic interface for Heuristics 
 */
interface IHeuristic
{
    /**
     * Forces the Heuristic to validate config
     */
    setup(config: IConfiguration): void;
}

export default IHeuristic;