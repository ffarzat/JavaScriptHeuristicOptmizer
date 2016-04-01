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
    logWritter: ILogger;
    
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
    FitType: string; 
    
    /**
     * Path to Log File [Relative]
     */
    LogFilePath: string;
    
    /**
     * Category for Logger
     */
    LogCategory: string;
    
    /**
     * Determines delete or not a Log file at the begining of process
     */
    LogFileClearing: boolean;
}

export default IConfiguration;