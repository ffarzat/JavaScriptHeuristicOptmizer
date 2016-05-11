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
var uuid = require('node-uuid');



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
    
    waitingMessages: Message[];   //store waiting messages
       
    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration): void {
        this._config = config;
        this._astExplorer = new ASTExplorer();
        events.EventEmitter.call(this);
        this.waitingMessages = [];
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
        this._logger.Write(`===================================================>1.Mutant Request!`);

        var mutant: Individual;

        await this.getResponse(msg, (msg) => {
            mutant = msg.ctx.First;
            this._logger.Write('===================================================>2.Mutant received');
        });
        
        this._logger.Write('===================================================>3.Mutant Response done!');
        
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

        return results;
    }


    /**
     * Update global best info
     */
    UpdateBest(newBest: Individual) {

        if (newBest.testResults.passedAllTests && this._tester.RetrieveConfiguratedFitFor(newBest) < this.bestFit && (newBest.ToCode() != this.bestIndividual.ToCode())) {
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
    
    /**
     * Over websockets objects loose instance methods
     */
    Reload(context:OperatorContext){
        return this._astExplorer.Reload(context);
    }
    
    /**
     * To resolve a single comunication with server trougth cluster comunication
     */
    async getResponse(msg: Message, cb: (ctx: Message) => void): Promise<void> {
        
        var p = new Promise<Message>( (resolve, reject) =>{
            process.once('message', (newMsg: Message) => {
                 var localMsg = this.Done(newMsg);
                 newMsg.ctx = this.Reload(newMsg.ctx);
                 localMsg.cb(newMsg); 
                 resolve(newMsg);
            });
                
            this.PushMessage(msg.ctx, cb);
        });
    
        (await Promise.resolve(p));
    }
    
    
    /**
     * Send a request to server
     */
    PushMessage(context: OperatorContext, cb: (ctx: Message) => void ) {
        var item = new Message();
        item.id = uuid.v4();
        item.ctx = context;
        item.cb = cb;
        this.waitingMessages.push(item);
        process.send(item);
    }
    
    /**
     * Relases the callback magic
     */
    Done(message: Message): Message{
        //Finds message index
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var element = this.waitingMessages[index];
            //this._logger.Write(`External: ${message.id} == ${element.id}`);
            if(element.id == message.id)
                break;
        }

        var localmsg = this.waitingMessages[index];
        this.waitingMessages.splice(index, 1); //cut off
        return localmsg;
    }
    
    
}





export default IHeuristic;