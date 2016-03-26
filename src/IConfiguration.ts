import IHeuristic from './heuristics/IHeuristic';
import ILogger from './ILogger';
import Library from './Library';

/**
 * Configuration Interface for Json file
 */
interface IConfiguration {
    file: string;
    libraries: Library[];
    heuristics: IHeuristic[];
    logWritter: ILogger;
}

export default IConfiguration;