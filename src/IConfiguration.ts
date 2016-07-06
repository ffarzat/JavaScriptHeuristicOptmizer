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
     * Diretory for Code Files and csv files 
     */
    resultsDirectory: string

    /**
     * TO use inside SUSE PBS
     */
    tmpDirectory: string

    /**
     * Filename for results.csv
     */
    trialResultsFile: string;

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
     * Results writter
     *  */
    outWriter: string;

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
     * Total clients to launch
     */
    clientsTotal: number;

    /**
     * #trial to restart a optmization
     */
    startTrial: number;

    /**
     * #Time to run tests 
     */
    testUntil: number;

    /**
     * Mutation until this number
     */
    mutationTrials: number;

    /**
     * crossOverTrials until this number
     */
    crossOverTrials: number;

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
     * Determines delete or not a Log file (and others olds files) at the begining of process
     */
    logFileClearing: boolean;

    /**
     * Server port 
     */
    port: number;

    /**
     * Servers url
     */
    url: string;

    /**
     * Clients timeout in seconds
     */
    clientTimeout: number;

    /**
     * Each trial configurations
     * 
     * Works with a IConfiguration.trials. #trials * each(TrialConfiguration)
     * 
     * Sample:
     *  #trials = 60
     *  #TrialConfiguration = 2 (global, function scope)
     *  #total executions = 120 per Heuristic (360 by now)
     */
    trialsConfiguration: TrialConfiguration[];

}

export default IConfiguration;