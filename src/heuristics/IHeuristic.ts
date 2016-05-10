import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import TrialResults from '../Results/TrialResults';
import ITester from '../ITester';
import ILogger from '../ILogger';
import LogFactory from '../LogFactory';
import TesterFactory from '../TesterFactory';
import Individual from '../Individual';

import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';
import Library from '../Library';


import Message from '../Sockets/Message';


import NodeIndex from './NodeIndex';

import events = require('events');



/**
 * Generic interface for Heuristics 
 */
abstract class IHeuristic extends events.EventEmitter {
    _config: TrialEspecificConfiguration;
    _logger: ILogger;
    _tester: ITester;
    _astExplorer: ASTExplorer;
    _lib: Library;

    public Name: string;
    public Trials: number;
    public bestFit: number;
    public bestIndividual: Individual;
    public mutationTrials: number;
    public crossOverTrials: number;

    public Original: Individual;
       
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration): void {
        this._config = config;
        this._astExplorer = new ASTExplorer();
        events.EventEmitter.call(this);
    }

    /**
     * Especific Run for each Heuristic
     */
    abstract async RunTrial(trialIndex: number): Promise<TrialResults>;

    /**
     *  Releases a Mutation over context 
     */
    public async Mutate(context: OperatorContext): Promise<Individual> {
        var msg: Message = new Message();
        context.Operation = "Mutation";
        msg.ctx = context;
        this._logger.Write(`===================================================> Asking for Mutation!`);

        //async way          
        var mutant  = await getMutant(msg);
        
        this._logger.Write('===================================================> Mutant back!');
        
        return mutant; 
    }

    /**
     * Releases a CrossOver over context
     */
    CrossOver(context: OperatorContext): Individual[] {
        return this._astExplorer.CrossOver(context);
    }

    /**
     * Global Test execution
     */
    Test(individual: Individual) {
        this._tester.Test(individual);
        //TODO: Delegate for any available client or processor available
    }

    /**
     * Calculate results for a trial
     */
    ProcessResult(trialIndex: number, original: Individual, bestIndividual: Individual): TrialResults {

        var results: TrialResults = new TrialResults();
        var bestCode = bestIndividual.ToCode();
        var originalCode = original.ToCode();

        results.trial = trialIndex;
        results.library = this._lib;
        results.heuristic = this;

        results.best = bestIndividual;
        results.bestIndividualAvgTime = this._tester.RetrieveConfiguratedFitFor(bestIndividual);
        results.bestIndividualCharacters = bestCode.length;
        results.bestIndividualLOC = bestCode.split(/\r\n|\r|\n/).length;

        results.original = original;
        results.originalIndividualAvgTime = this._tester.RetrieveConfiguratedFitFor(original);
        results.originalIndividualCharacters = originalCode.length;
        results.originalIndividualLOC = originalCode.split(/\r\n|\r|\n/).length;

        this._logger.Write(`Ending ${this.Name}`);
        this._logger.Write('=================================');


        return results;
    }


    /**
     * Update global best info
     */
    UpdateBest(newBest: Individual) {

        if (this._tester.RetrieveConfiguratedFitFor(newBest) < this.bestFit && (newBest.ToCode() != this.bestIndividual.ToCode())) {
            this._logger.Write('=================================');
            this.bestFit = this._tester.RetrieveConfiguratedFitFor(newBest);
            this.bestIndividual = newBest;
            this._logger.Write(`New Best Fit ${this.bestFit}`);
            this._logger.Write('=================================');
        }
    }

    /**
     * Index By Node Type a individual code
     */
    IndexBy(nodeType: string, individual: Individual): NodeIndex {
        var index = this._astExplorer.IndexNodesBy(nodeType, individual);
        var node = { "Type": nodeType, "ActualIndex": 0, "Indexes": index };
        return node;
    }


    /**
    * Releases a mutation over an AST  by nodetype and index
    */
    MutateBy(clone: Individual, indexes: NodeIndex): Individual {
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

    /**
     * Defines library over optmization
     */
    SetLibrary(library: Library) {

        this._lib = library;
        this.Original = this.CreateOriginalFromLibraryConfiguration(library);
        this.Test(this.Original);
        //Force Best
        this.bestFit = this._tester.RetrieveConfiguratedFitFor(this.Original);
        this.bestIndividual = this.Original;

        this._logger.Write(`Original Fit ${this.bestFit}`);
        this._logger.Write('=================================');
    }


    /**
     * Create the orginal individual from library settings
     */
    CreateOriginalFromLibraryConfiguration(library: Library): Individual {
        return this._astExplorer.GenerateFromFile(library.mainFilePath);
    }
}

/**
 * Async Get Mutant from Server
 */
async function getMutant(msg:Message): Promise<Individual>{
    
    this._logger.Write(`    Send message to master process`); 
    process.send(msg);
    
    var message = await Promise.resolve(getResponse()); 
    return message.ctx.First;
}


/**
 * To resolve a single comunication with server trougth cluster comunication
 */
async function getResponse(): Promise<Message> {
    return new Promise<Message>( (resolve, reject) => {
        this._logger.Write(`    Receive messages from the master process`);
        process.on('message', (newMsg: Message) => {
            this._logger.Write(`    Promise Resolved`);
            resolve(newMsg);
        });
    });
}



export default IHeuristic;