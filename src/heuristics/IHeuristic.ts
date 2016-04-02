import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import ILogger from '../ILogger';
import LogFactory from '../LogFactory';
import TesterFactory from '../TesterFactory';
import Individual from '../Individual';

/**
 * Generic interface for Heuristics 
 */
abstract  class IHeuristic
{
    _config: IConfiguration;
    _logger: ILogger;
    _tester: ITester;
    
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: IConfiguration): void{
         
        this.DoValidation(config); 
        this._config = config;
        
        //Creates the ILogger especific fro this config
        this._logger = new LogFactory().CreateByName(this._config.logWritter);
        
        //Creates the Tester especific fro this config
        this._tester = new TesterFactory().CreateByName(this._config.tester);
    }
    
    /**
     * Especific Run for each Heuristic
     */
    abstract RunTrials();
    
    /**
     * Global Test configuration
     */
    Test(individual: Individual){
        // creates a new instance
        //Delegate for any available client
        //save results over individual it self
    }
    
    /**
     * Global notifications about process run status
     */
    Notify(){
        
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
}


export default IHeuristic;