import IConfiguration from './IConfiguration';
import ILogger from './ILogger';
import ITester from './ITester';
import IOutWritter from './IOutWritter';

/**
 * Optmizer
 */
export default class Optmizer {
    
    configuration: IConfiguration;
    logger: ILogger;
    tester: ITester;
    outter: IOutWritter;
    
    
    
    /**
     * Initializes intire Setup chain
     */
    Setup(config: IConfiguration) {
        //Instantiates and calls all others Setup methods
    }
    
    /**
     * Initializes configurated logger class
     */
    private InitializeLogger(){
        
    }
    
    /**
     * Initializes configurated Results Writter
     * 
     */
    private InitializeOutWritter(){
        
    }
    
    /**
     * Initializes configurated Heuristics
     */
    private IntializeHeuristics(){
        
    }
    
    /**
     * Notifies about results of improvement
     */
    private Notify(){
        
    }
    
    /**
     * Initializes intire Improvement Process
     */
    DoOptmization(){
        
    }
    
}