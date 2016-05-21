import IConfiguration from '../IConfiguration';
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
import fs = require('fs');
var uuid = require('node-uuid');



/**
 * Generic interface for Heuristics 
 */
abstract class IHeuristic extends events.EventEmitter {
    _config: TrialEspecificConfiguration;
    _globalConfig: IConfiguration
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
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {
        this._config = config;
        this._globalConfig = globalConfig;
        this._astExplorer = new ASTExplorer();
        events.EventEmitter.call(this);
        this.waitingMessages = [];

        process.on('message', (newMsg: Message) => {
            var localMsg = this.Done(newMsg);
            if (localMsg) {
                newMsg.ctx = this.Reload(newMsg.ctx);
                localMsg.cb(newMsg);
            }
        });
    }

    /**
     * Especific Run for each Heuristic
     */
    abstract async RunTrial(trialIndex: number): Promise<TrialResults>;

    /**
     *  Releases a Mutation over context 
     */
    public async Mutate(context: OperatorContext): Promise<Individual> {

        return new Promise<Individual>(async (resolve) => {
            var msg: Message = new Message();
            context.Operation = "Mutation";
            context.MutationTrials = this._globalConfig.mutationTrials;
            context.LibrarieOverTest = this._lib;
            context.Original = this.bestIndividual;

            msg.ctx = context;

            this.getResponse(msg, (newMsg) => {
                resolve(newMsg.ctx.First);
            });
        });
    }

    /**
     * Releases a CrossOver over context
     */
    public async CrossOver(first: Individual, second: Individual): Promise<Individual[]> {
        return new Promise<Individual[]>(async (resolve) => {
            var context = new OperatorContext();
            context.Operation = "CrossOver";
            context.CrossOverTrials = this._globalConfig.crossOverTrials;
            context.LibrarieOverTest = this._lib;
            context.Original = this.bestIndividual;
            context.First = first;
            context.Second = second;

            var msg: Message = new Message();
            msg.ctx = context;

            this.getResponse(msg, (newMsg) => {
                //this._logger.Write(`         [IHeuristic]First fit ${newMsg.ctx.First.testResults.fit}`);
                //this._logger.Write(`         [IHeuristic]Second fit ${newMsg.ctx.Second.testResults.fit}`);
                resolve([newMsg.ctx.First, newMsg.ctx.Second]);
            });
        });
    }

    /**
     * Global Test execution
     */
    public async Test(individual: Individual): Promise<Individual> {
        var msg: Message = new Message();
        var context = new OperatorContext();
        context.Operation = "Test";
        context.First = individual;
        context.Original = this.bestIndividual; //is usual to be the original
        context.LibrarieOverTest = this._lib;

        msg.ctx = context;

        var p = new Promise<Individual>(resolve => {
            this.getResponse(msg, (newMsg) => {
                resolve(newMsg.ctx.First);
            });
        });

        return p;
    }

    /**
     * Calculate results for a trial
     */
    ProcessResult(trialIndex: number, original: Individual, bestIndividual: Individual): TrialResults {

        this.WriteCodeToFile(this.Original, this._lib); //back original Code to lib

        var results: TrialResults = new TrialResults();
        var bestCode = bestIndividual.ToCode();
        var originalCode = original.ToCode();

        results.trial = trialIndex;
        results.library = this._lib;
        results.heuristic = this;

        results.best = bestIndividual;
        results.bestIndividualAvgTime = bestIndividual.testResults.fit;
        results.bestIndividualCharacters = bestCode.length;
        results.bestIndividualLOC = bestCode.split(/\r\n|\r|\n/).length;

        results.original = original;
        results.originalIndividualAvgTime = original.testResults.fit;
        results.originalIndividualCharacters = originalCode.length;
        results.originalIndividualLOC = originalCode.split(/\r\n|\r|\n/).length;

        return results;
    }


    /**
     * Update global best info
     */
    UpdateBest(newBest: Individual): boolean {
        var found: boolean = false;
        if (newBest.testResults && newBest.testResults.passedAllTests && newBest.testResults.fit < this.bestFit && (newBest.ToCode() != this.bestIndividual.ToCode())) {
            this._logger.Write('=================================');
            this.bestFit = newBest.testResults.fit;
            this.bestIndividual = newBest;
            this._logger.Write(`New Best Fit ${this.bestFit}`);
            this._logger.Write('=================================');
            found = true;
        }
        return found;
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
    async MutateBy(clone: Individual, indexes: NodeIndex): Promise<Individual> {
        return new Promise<Individual>(async (resolve) => {
            var type = indexes.Type;
            var actualNodeIndex = indexes.Indexes[indexes.ActualIndex];
            indexes.ActualIndex++;

            this._logger.Write(`Mutant: [${type}, ${indexes.ActualIndex}]`);

            var ctx: OperatorContext = new OperatorContext();
            ctx.First = clone;
            ctx.NodeIndex = actualNodeIndex;
            ctx.LibrarieOverTest = this._lib;
            ctx.Original = this.bestIndividual;
            ctx.Operation = "MutationByIndex";
            ctx.MutationTrials = this._globalConfig.mutationTrials;

            var msg: Message = new Message();
            msg.ctx = ctx;

            this.getResponse(msg, (newMsg) => {
                resolve(newMsg.ctx.First);
            });
        });
    }

    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    GenereateRandom(low, high): number {
        return this._astExplorer.GenereateRandom(low, high);
    }

    /**
     * Util for Winmerge comparsions
     */
    private WriteCodeToFile(individual: Individual, lib: Library) {
        fs.writeFileSync(lib.mainFilePath, individual.ToCode());
    }

    /**
     * Defines library over optmization
     */
    async SetLibrary(library: Library) {

        this._lib = library;
        this.Original = this.CreateOriginalFromLibraryConfiguration(library);
        this.bestIndividual = this.Original;
        this.Original = await this.Test(this.Original);
        //this._logger.Write(`Orginal results: ${this.Original.testResults}`);

        if (!this.Original.testResults.passedAllTests)
            throw `Failed to execute tests for ${library.name}`;

        //Force Best
        this.bestFit = this.Original.testResults.fit;
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
    Reload(context: OperatorContext): OperatorContext {
        return this._astExplorer.Reload(context);
    }

    /**
     * To resolve a single comunication with server trougth cluster comunication
     */
    async getResponse(msg: Message, cb: (msgBack: Message) => void) {
        var item = new Message();
        item.id = uuid.v4();
        item.ctx = msg.ctx;
        item.cb = cb;
        this.waitingMessages.push(item);
        process.send(item);
    }

    /**
     * Relases the callback magic
     */
    Done(message: Message): Message {
        //Finds message index
        var indexFounded = -1;
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var element = this.waitingMessages[index];
            //this._logger.Write(`External: ${element.id} == ${message.id}`);
            //this._logger.Write(`break?: ${element.id === message.id}`);
            //this._logger.Write(`element.id: ${typeof element.id}`);
            //this._logger.Write(`message.id: ${typeof message.id}`);
            if (element.id === message.id) {
                //this._logger.Write(`do break... : ${element.id === message.id}`);
                indexFounded = index;
                break;
            }
        }


        //this._logger.Write(`Index fouded ${indexFounded}`);
        //this._logger.Write(`Messages waiting ${this.waitingMessages.length}`);

        var localmsg = this.waitingMessages[indexFounded];
        if (!localmsg) {
            //this._logger.Write('Incoming message not located inside Heuristic Queue ' + message.id); //error log?
        }
        else {
            this.waitingMessages.splice(index, 1); //cut off    
        }

        return localmsg; //maybe a message or undefined
    }


}





export default IHeuristic;