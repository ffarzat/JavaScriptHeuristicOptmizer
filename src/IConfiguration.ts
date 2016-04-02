import IHeuristic from './heuristics/IHeuristic';
import ILogger from './ILogger';
import Library from './Library';

/**
 * Configuration Interface for Json file
 */
interface IConfiguration {
    
    /**
     * This file path
     */
    file: string;
    
    /**
     * Subjects
     */
    libraries: Library[];
    
    /**
     * Configurated Heuristics to run over libs #trial times 
     */
    heuristics: IHeuristic[];
    
    /**
     * Logtype
     */
    logWritter: string;
    
    /**
     * Tester Type
     */
    tester: string;
    
    /**
     * #Time to run optmization process
     */
    trials: number;
    
    /**
     * #Time to run tests 
     */
    testUntil: number;
    
    /**
     * Fit type: can be mean or median 
     */
    fitType: string; 
    
    /**
     * Path to Log File [Relative]
     */
    logFilePath: string;
    
    /**
     * Category for Logger
     */
    logCategory: string;
    
    /**
     * Determines delete or not a Log file at the begining of process
     */
    logFileClearing: boolean;
}

export default IConfiguration;