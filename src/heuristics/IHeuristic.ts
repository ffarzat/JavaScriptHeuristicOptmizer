import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
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
    _config: TrialEspecificConfiguration;
    _logger: ILogger;
    _tester: ITester;
    
    public Trials:number;
    
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration): void{
        this._config = config;
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
}


export default IHeuristic;