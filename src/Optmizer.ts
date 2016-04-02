import IConfiguration from './IConfiguration';
import IHeuristic from './heuristics/IHeuristic';
import HeuristicFactory from './heuristics/HeuristicFactory';
import ILogger from './ILogger';
import ITester from './ITester';
import IOutWriter from './IOutWriter';
import LogFactory from './LogFactory';
import TesterFactory from './TesterFactory';

/**
 * Optmizer
 */
export default class Optmizer {
    
    configuration: IConfiguration;
    logger: ILogger;
    tester: ITester;
    outter: IOutWriter;
    nodesSelectionApproach: string;
    nodesType: string [] = [];
    heuristics: IHeuristic [] = [];
    trialIndex: number;
            
    /**
     * Initializes intire Setup chain
     */
    Setup(config: IConfiguration, trialIndex: number) {
        this.DoValidation(config)
        this.trialIndex = trialIndex;
        this.nodesSelectionApproach = this.configuration.trialsConfiguration[trialIndex].nodesSelectionApproach;
        this.nodesType = this.configuration.trialsConfiguration[trialIndex].nodesType;
    }
    
    /**
     * Do the configuration object validation
     */
    private DoValidation(config: IConfiguration){
      
      if(config.libraries.length == 0)
      {
          throw "Needs some Lib to run Improvement Process";    
      }
      
      if(config.logWritter.length == 0)
      {
          throw "Needs LogWritter configuration";    
      }
      
      if(!config.trials && config.trials == 0)
      {
          throw "Needs Total Trials configuration";    
      }
      
      if(config.heuristics.length == 0)
      {
          throw "Needs some Heuristic to run Improvement Process";    
      }
      
    }
    
    /**
     * Initializes configurated logger class
     */
    private InitializeLogger(){
        this.logger = new LogFactory().CreateByName(this.configuration.logWritter);
    }
    
    /**
     * Initializes configurated Tester class
     */
    private InitializeTester(){
        this.tester = new TesterFactory().CreateByName(this.configuration.tester);   
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
        var factory: HeuristicFactory = new HeuristicFactory();
     
        this.configuration.heuristics.forEach(element => {
            var heuristic = factory.CreateByName(element);
            heuristic.Setup(this.configuration.trialsConfiguration[this.trialIndex].especific);
            heuristic.Trials = this.configuration.trials;
            
            this.heuristics.push(heuristic);
        });
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