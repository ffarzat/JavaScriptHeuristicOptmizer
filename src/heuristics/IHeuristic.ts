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
var exectimer = require('exectimer');

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

    waitingMessages: any;   //store waiting messages

    Tick: any;
    trialUuid: any;

    ActualGlobalTrial: number
    ActualInternalTrial: number
    ActualLibrary: string;
    CleanServer: boolean;

    /**
     * Forces the Heuristic to validate config
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {
        this._config = config;
        this._globalConfig = globalConfig;
        this._astExplorer = new ASTExplorer();
        events.EventEmitter.call(this);
        this.waitingMessages = {};
        this.trialUuid = uuid.v4();
    }

    /**
     *
     */
    constructor() {
        super();

        process.on('message', (newMsg: Message) => {
            this.Done(newMsg);
        });
    }

    public Start() {
        this._logger.Write(`[IHeuristic] Started Event [${this.trialUuid}]`);
        this.Tick = new exectimer.Tick(this.trialUuid);
        this.Tick.start();
    }

    public Stop() {
        this._logger.Write('[IHeuristic] Finisehd Event');
        this.Tick.stop();
    }


    /**
     * Especific Run for each Heuristic
     */
    abstract RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void);

    /**
     *  Releases a Mutation over context 
     */
    public Mutate(context: OperatorContext, cb: (mutant: Individual) => void) {
        var msg: Message = new Message();
        context.Operation = "Mutation";
        context.MutationTrials = this._globalConfig.mutationTrials;
        context.LibrarieOverTest = this._lib;
        context.Original = this.bestIndividual;
        msg.ctx = context;

        this.getResponse(msg, (newMsg) => {
            cb(newMsg.ctx.First);
        });
    }

    /**
     * Releases a CrossOver over context
     */
    public CrossOver(first: Individual, second: Individual, cb: (newOnes: Individual[]) => void) {

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
            cb([newMsg.ctx.First, newMsg.ctx.Second]);
        });
    }

    /**
     * Global Test execution
     */
    public Test(individual: Individual, cb: (original: Individual) => void) {
        var msg: Message = new Message();
        var context = new OperatorContext();
        context.Operation = "Test";
        context.First = individual;
        context.Original = this.bestIndividual; //is usual to be the original
        context.LibrarieOverTest = this._lib;

        msg.ctx = context;

        this.getResponse(msg, (newMsg) => {
            cb(newMsg.ctx.First);
        });
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

        var trialTimer = exectimer.timers[this.trialUuid];
        results.time = this.ToNanosecondsToMinutes(trialTimer.duration());
        results.better = bestCode != originalCode

        return results;
    }

    /**
     * Transform nano secs in minutes
     */
    ToNanosecondsToMinutes(nanovalue: number): number {
        return parseFloat((parseFloat((nanovalue / 1000000000.0).toFixed(1)) / 60).toFixed(1));
    }

    /**
     * datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
     */
    DateDiff(datepart, fromdate, todate) {
        datepart = datepart.toLowerCase();
        var diff = todate - fromdate;
        var divideBy = {
            w: 604800000,
            d: 86400000,
            h: 3600000,
            n: 60000,
            s: 1000
        };

        return Math.floor(diff / divideBy[datepart]);
    }

    /**
     * Update global best info
     */
    UpdateBest(newBest: Individual): boolean {
        var found: boolean = false;
        try {
            if (newBest.testResults && newBest.testResults.passedAllTests && newBest.testResults.fit < this.bestFit && (newBest.ToCode() != this.bestIndividual.ToCode())) {
                this._logger.Write('=================================');
                this.bestFit = newBest.testResults.fit;
                this.bestIndividual = newBest;
                this._logger.Write(`New Best Fit ${this.bestFit}`);
                this._logger.Write('=================================');
                found = true;
            }
        }
        catch (err) {
            this._logger.Write(`[IHeuristic] ${err}`);
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
    MutateBy(clone: Individual, indexes: NodeIndex, cb: (mutant) => void) {

        var type = indexes.Type;
        var actualNodeIndex = indexes.Indexes[indexes.ActualIndex];
        indexes.ActualIndex++;

        //this._logger.Write(`Mutant: [${type}, ${indexes.ActualIndex}]`);

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
            cb(newMsg.ctx.First);
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
     * Defines library and test original code
     */
    SetLibrary(library: Library, cb: () => void) {

        this._lib = library;
        this.Original = this.CreateOriginalFromLibraryConfiguration(library);
        this.bestIndividual = this.Original;

        this.Test(this.Original, (testedOriginal) => {
            this.Original = testedOriginal;

            //this._logger.Write(`Orginal results: ${this.Original.testResults}`);

            if (!this.Original.testResults || !this.Original.testResults.passedAllTests)
                throw new Error(`Failed to execute tests for ${library.name}`);

            //Force Best
            this.bestFit = this.Original.testResults.fit;
            this.bestIndividual = this.Original;

            this._logger.Write(`Original Fit ${this.bestFit}`);
            this._logger.Write('=================================');

            cb();
        });

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
    getResponse(msg: Message, cb: (msgBack: Message) => void) {
        msg.id = uuid.v4();
        msg.cb = cb;

        this._logger.Write(`[IHeuristic] CleanServer: ${msg.CleanServer}`);

        this.waitingMessages[msg.id] = msg;

        var item = new Message();
        item.id = msg.id;
        item.ctx = msg.ctx;

        item.ActualGlobalTrial = this.ActualGlobalTrial;
        item.ActualHeuristic = this.Name;
        item.ActualInternalTrial = this.ActualInternalTrial;
        item.ActualLibrary = this.ActualLibrary;
        item.CleanServer = this.CleanServer;

        if(this.CleanServer)
            this.CleanServer = false;

        process.send(item);
    }

    /**
     * Relases the callback magic
     */
    Done(message: Message) {
        try {
            if (message != undefined) {
                var localmsg = this.waitingMessages[message.id];
                if (localmsg != undefined) {
                    clearTimeout(localmsg.tmeoutId);
                    localmsg.tmeoutId = undefined;
                    delete this.waitingMessages[message.id];

                    localmsg.ctx = this.Reload(message.ctx);
                    localmsg.cb(localmsg);
                }
                //else {
                    //this._logger.Write(`[IHeuristic] Msg ${message.id} not founded. WaitingMessages : ${Object.keys(this.waitingMessages).length}`);
                //}
            }

        } catch (error) {
            this._logger.Write(`${error.stack}`);
        }
    }

    runGC() {
        if (typeof global.gc != "undefined") {
            //this._logger.Write(`Mem Usage Pre-GC ${this.formatBytes(process.memoryUsage().heapTotal, 2)}`);
            //global.gc();
            //this._logger.Write(`Mem Usage Post-GC ${this.formatBytes(process.memoryUsage().heapTotal, 2)}`);
        }
    }

    /**
     * Format for especific size
     */
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

}


export default IHeuristic;