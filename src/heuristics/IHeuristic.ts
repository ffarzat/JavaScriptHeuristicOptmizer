import Configuration from '../Configuration';

/**
 * Generic interface for Heuristics 
 */
interface IHeuristic
{
    /**
     * Forces the Heuristic to validate config
     */
    setup(config: Configuration): void;
}

export default IHeuristic;