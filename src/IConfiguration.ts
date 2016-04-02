import IHeuristic from './heuristics/IHeuristic';
import ILogger from './ILogger';
import Library from './Library';
import TrialConfiguration from './TrialConfiguration';

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
     * Configurated Heuristics 
     * 
     * By now can be:
     * [GA, HC, RD]
     */
    heuristics: string[];
    
    /**
     * Logtype
     * 
     * By now can be:
     * [ConcreteLogger]
     * 
     */
    logWritter: string;
    
    /**
     * Tester Type
     * 
     * By now can be:
     * 
     * [CommandTester]
     * 
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
    
    /**
     * Global trial configurations
     */
    trialConfiguration: TrialConfiguration;
    
}

export default IConfiguration;