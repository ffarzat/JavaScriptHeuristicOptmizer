import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import TrialResults from '../Results/TrialResults';
import ITester from '../ITester';
import ILogger from '../ILogger';
import LogFactory from '../LogFactory';
import TesterFactory from '../TesterFactory';
import Individual from '../Individual';

import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';


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
    abstract RunTrial(trialIndex: number): TrialResults;
    
    /**
     *  Releases a Mutation over context 
     */
    Mutate(context: OperatorContext): Individual{
        var astExplorer: ASTExplorer = new ASTExplorer();
        return astExplorer.Mutate(context); 
    }
    
    /**
     * Global Test configuration
     */
    Test(individual: Individual){
        // creates a new instance
        //Delegate for any available client
        //save results over individual it self
    }
}


export default IHeuristic;