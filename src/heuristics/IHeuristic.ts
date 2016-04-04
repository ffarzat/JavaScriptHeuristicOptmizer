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
    _astExplorer: ASTExplorer;
    _totalNodeCount: number;
    
    public Trials:number;
    
    bestFit: number;
    bestIndividual: Individual;
    
    
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration): void{
        this._config = config;
        this._astExplorer = new ASTExplorer();
        this._totalNodeCount = 0;
    }
    
    /**
     * Especific Run for each Heuristic
     */
    abstract RunTrial(trialIndex: number, original: Individual): TrialResults;
    
    /**
     *  Releases a Mutation over context 
     */
    Mutate(context: OperatorContext): Individual{
        return this._astExplorer.Mutate(context); 
    }
    
    /**
     * Releases a CrossOver over context
     */
    CrossOver(context: OperatorContext): Individual []{
       context.TotalNodesCount = this._totalNodeCount;
       return this._astExplorer.CrossOver(context); 
    }
    
    /**
     * Global Test execution
     */
    Test(individual: Individual){
        this._tester.Test(individual);
        //TODO: Delegate for any available client or processor available
    }
    
    /**
     * Calculate results for a trial
     */
    ProcessResult(trialIndex: number, original: Individual, bestIndividual: Individual): TrialResults{
        
        var results: TrialResults = new TrialResults();
        var bestCode = bestIndividual.ToCode();
        var originalCode = original.ToCode();
        
        results.trial = trialIndex;
        
        results.best = bestIndividual;
        results.bestIndividualAvgTime = this._tester.RetrieveConfiguratedFitFor(bestIndividual);
        results.bestIndividualCharacters = bestCode.length;
        results.bestIndividualLOC = bestCode.split(/\r\n|\r|\n/).length;
        
        results.originalIndividualAvgTime = this._tester.RetrieveConfiguratedFitFor(original);
        results.originalIndividualCharacters = originalCode.length;
        results.originalIndividualLOC =   originalCode.split(/\r\n|\r|\n/).length;
        
        return results;
    }
    
        
    /**
     * Update global best info
     */
    UpdateBest(newBest: Individual){
        this.bestFit =  this._tester.RetrieveConfiguratedFitFor(newBest);
        this.bestIndividual = newBest;  
    }
}


export default IHeuristic;