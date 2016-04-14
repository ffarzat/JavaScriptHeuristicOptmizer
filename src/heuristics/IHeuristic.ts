import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import TrialResults from '../Results/TrialResults';
import ITester from '../ITester';
import ILogger from '../ILogger';
import LogFactory from '../LogFactory';
import TesterFactory from '../TesterFactory';
import Individual from '../Individual';

import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';


import NodeIndex from './NodeIndex';


/**
 * Generic interface for Heuristics 
 */
abstract  class IHeuristic
{
    _config: TrialEspecificConfiguration;
    _logger: ILogger;
    _tester: ITester;
    _astExplorer: ASTExplorer;
    
    
    
    public Trials:number;
    public bestFit: number;
    public bestIndividual: Individual;
    public mutationTrials: number;
    public crossOverTrials: number;
    
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration): void{
        this._config = config;
        this._astExplorer = new ASTExplorer();
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
        
        if(this._tester.RetrieveConfiguratedFitFor(newBest) < this.bestFit)
        {
            this.bestFit =  this._tester.RetrieveConfiguratedFitFor(newBest);
            this.bestIndividual = newBest;    
        }
    }
    
    /**
     * Index By Node Type a individual code
     */
    IndexBy(nodeType: string, individual: Individual): NodeIndex{
        var index = this._astExplorer.IndexNodesBy(nodeType, individual);
        var node = {"Type": nodeType, "ActualIndex": 0, "Indexes": index};
        return node;
    }
    
    
     /**
     * Releases a mutation over an AST  by nodetype and index
     */
     MutateBy(clone: Individual, indexes: NodeIndex): Individual{
        var type = indexes.Type;
        var actualNodeIndex = indexes[indexes.ActualIndex];
        indexes.ActualIndex++;
        
        var ctx: OperatorContext = new OperatorContext();
        ctx.First = clone;
        ctx.NodeIndex = actualNodeIndex;
        
        return this._astExplorer.MutateBy(ctx); 
    }
    
    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    GenereateRandom(low, high): number {
        return this._astExplorer.GenereateRandom(low, high);
    }
}


export default IHeuristic;