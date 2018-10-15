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
var async = require('async');

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

    _hasListener: boolean;

    public Name: string;
    public Trials: number;
    public bestFit: number;
    public bestIndividual: Individual;
    public mutationTrials: number;
    public crossOverTrials: number;

    public nodesSelectionApproach: string;
    public byFunctionType: string;

    public Original: Individual;

    waitingMessages: any;   //store waiting messages

    Tick: any;
    trialUuid: any;

    public ActualGlobalTrial: number
    public ActualInternalTrial: number
    public ActualLibrary: string;
    public CleanServer: boolean;

    Pool: any;

    nextId: number;

    cbs: any;

    Hosts: Array<string>;
    Messages: any;

    functionStack: Array<string>;

    ActualBestForFunctionScope: Individual;
    ActualFunction: string;

    FoundedAnyBetter: boolean;

    totalOperationsCounter: number;


    operationsCount: number;
    neighbors: Individual[];

    nodesType: string[];

    updatedIndexList;

    /**
    * Forces the Heuristic to validate config
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration, allHosts: Array<string>): void {
        this._config = config;
        this._globalConfig = globalConfig;
        this._astExplorer = new ASTExplorer();
        events.EventEmitter.call(this);
        this.waitingMessages = {};
        this.trialUuid = uuid.v4();
        this.nextId = 0;
        this.cbs = {};
        this.Hosts = allHosts;
        this.Messages = {};
        this.functionStack = [];
        this.FoundedAnyBetter = false;
        this.nodesType = config.nodesType;
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
        context.Original = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
        this.IncluirParametrosPorFuncao(context);
        msg.ctx = context;

        this.getResponse(msg, (newMsg) => {
            var bestForAMoment = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
            if (newMsg == undefined) {
                cb(bestForAMoment);
                return;
            }
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
        context.Original = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
        context.First = first;
        context.Second = second;
        var msg: Message = new Message();

        this.IncluirParametrosPorFuncao(context);
        msg.ctx = context;

        this.getResponse(msg, (newMsg) => {
            var bestForAMoment = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
            if (newMsg == undefined) {

                cb([bestForAMoment, bestForAMoment]);
                return;
            }

            try {
                cb([newMsg.ctx.First, newMsg.ctx.Second]);
                return;
            } catch (error) {
                this._logger.Write(`[IHeuristic] CrossOver Failed ${error.stack}}`);
                cb([bestForAMoment, bestForAMoment]);
            }

            return;
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
        context.Original = this.bestIndividual.Clone(); //is usual to be the original
        context.LibrarieOverTest = this._lib;
        context.MemoryToUse = this._globalConfig.memory == undefined ? 2047 : this._globalConfig.memory;

        //this.IncluirParametrosPorFuncao(context);

        msg.FirstOne = true;
        msg.ctx = context;
        msg.id = 5000;

        this.getResponse(msg, (newMsg) => {

            if (newMsg == undefined) {
                cb(undefined);
                return;
            }

            cb(newMsg.ctx.First);
        });
    }

    /**
    * Calculate results for a trial
    */
    ProcessResult(trialIndex: number, original: Individual, bestIndividual: Individual): TrialResults {

        //this.WriteCodeToFile(this.Original, this._lib); //back original Code to lib

        this._logger.Write(`[IHeuristic] bestIndividual.testResults = ${bestIndividual.testResults == undefined}`);

        if (this.nodesSelectionApproach == 'ByFunction' && bestIndividual.testResults == undefined) {
            this._logger.Write(`[IHeuristic] Não encontrou melhor. Voltando ao original...`);
            bestIndividual = this.Original.Clone();
        }


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
        results.time = this.ToNanosecondsToSeconds(trialTimer.duration());
        results.better = bestCode != originalCode;

        return results;
    }

    /**
    * Transform nano secs in secs
    */
    private ToNanosecondsToSeconds(nanovalue: number): number {
        return parseFloat((nanovalue / 1000000000.0).toFixed(3));
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
        var newCode = newBest.ToCode();
        try {
            var localBest: Individual = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();

            if (newBest.testResults && newBest.testResults.passedAllTests && (parseInt(newBest.testResults.fit.toString()) < parseInt(this.bestFit.toString())) && (newCode != "") && (newCode != localBest.ToCode())) {
                this._logger.Write('=================================');
                this._logger.Write(`Older Fit ${this.bestFit}`);
                this.bestFit = newBest.testResults.fit;
                this.ActualBestForFunctionScope = newBest.Clone();
                this.bestIndividual = this.nodesSelectionApproach == "ByFunction" ? this.bestIndividual : newBest.Clone();
                this._logger.Write(`New Best Fit ${this.bestFit}`);
                this._logger.Write(`Total nodes removed: ${this.bestIndividual.removedIDS.length}`);
                this._logger.Write('=================================');
                found = true;
                this.FoundedAnyBetter = found;

                if (this.Name == "GA")
                    this.RefreshIndexList();
            }
        }
        catch (err) {
            this._logger.Write(`[IHeuristic] ${err}`);
        }

        return found;
    }

    RefreshIndexList() {
        var localBest = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
        this.updatedIndexList = this.DoIndexes(localBest).slice();
    }

    /**
    * Index By Node Type a individual code
    */
    IndexBy(nodesType: string[], individual: Individual): NodeIndex[] {
        var objIndices = this._astExplorer.IndexNodesBy(nodesType, individual);
        var lista: NodeIndex[] = [];

        for (var key in objIndices) {
            if (objIndices.hasOwnProperty(key)) {
                var element = objIndices[key];
                if (element.Indexes.length > 0)
                {
                    this._logger.Write(`[IHeuristic] ${element.Type}: ${element.Indexes.length}`);
                    lista.push(element);
                }
            }
        }

        return lista;
    }


    /**
    * Releases a mutation over an AST  by nodetype and index
    */
    MutateBy(clone: Individual, indexes: NodeIndex, cb: (mutant) => void) {

        var type = indexes.Type;
        var indiceGlobalAtual = indexes.ActualIndex;
        var actualNodeIndex = indexes.Indexes[indexes.ActualIndex];
        this._logger.Write(`Mutant: [${type}, ${indexes.ActualIndex}]`);

        var ctx: OperatorContext = new OperatorContext();
        ctx.First = clone;
        ctx.NodeIndex = actualNodeIndex;
        ctx.instructionType = type;
        ctx.globalIndexForinstructionType = indiceGlobalAtual;
        indexes.ActualIndex++;
        ctx.LibrarieOverTest = this._lib;
        ctx.Original = this.Original;
        ctx.Operation = "MutationByIndex";
        ctx.MutationTrials = this._globalConfig.mutationTrials;

        this.IncluirParametrosPorFuncao(ctx);

        var msg: Message = new Message();
        msg.ctx = ctx;

        this.getResponse(msg, (newMsg) => {
            //this._logger.Write(`[HC] newMsg: ${newMsg ==undefined}`);
            //this._logger.Write(`[HC] newMsg.ctx.First: ${newMsg.ctx.First.testResults ==undefined}`);

            var bestForAMoment = this.nodesSelectionApproach == "ByFunction" ? this.ActualBestForFunctionScope.Clone() : this.bestIndividual.Clone();
            if (newMsg == undefined) {
                cb(bestForAMoment);
                return;
            }

            cb(newMsg.ctx.First);
            return;
        });
    }

    /**
    * Populates the indexes for NodeType inside Code
    */
    DoIndexes(original: Individual): NodeIndex[] {
        var nodesIndexList: NodeIndex[] = [];

        if (this.nodesType.length > 0) {
            nodesIndexList = this.IndexBy(this.nodesType, original);
        }
        else {
            this._logger.Write(`[IHeuristic] FATAL: There is no configuration for NodeType for Optmization`);
            throw "[IHeuristic] There is no configuration for NodeType for Optmization";
        }

        return nodesIndexList;
    }

    /**
     * Caso seja necessário incluir os parametros para execução por Função
     */
    IncluirParametrosPorFuncao(ctx: OperatorContext) {
        if (this.nodesSelectionApproach == "ByFunction") {
            ctx.nodesSelectionApproach = this.nodesSelectionApproach;
            ctx.ActualBestForFunctionScope = this.ActualBestForFunctionScope;
            ctx.functionName = this.ActualFunction;
        }
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
        var file = `Libraries/${this._lib.name}/${this._lib.mainFilePath}`;
        fs.writeFileSync(file, individual.ToCode());
    }

    /**
         * Retorna a próxima melhor funçao para otimizar
         */
    RecuperarMelhorFuncaoAtual(): string {
        var melhorFuncao = undefined;

        while (this.functionStack.length > 0) {
            melhorFuncao = this.functionStack.shift();

            this.bestIndividual = this._astExplorer.GetFunctionAstByName(this.ActualBestForFunctionScope, melhorFuncao);
            if (this.bestIndividual != undefined) {
                console.log(`[IHeuristic] AST da função: ${melhorFuncao} encontrada!`);
                break;
            }

        }

        return melhorFuncao;
    }

    /**
     * Recupera a lista de funções (estática ou dinâmica) e a ordena de maior pra menor
     */
    MakeFunctionList() {
        var list = this.byFunctionType == "dynamic" ? JSON.parse(fs.readFileSync(`Libraries/${this._lib.name}/resultados-dinamico.json`).toString()) : this.getFunctionStaticList();
        var keysSorted = Object.keys(list).sort((a, b) => { return list[b] - list[a] });
        for (let element in keysSorted) {
            console.log(`Função ${keysSorted[element]}: ${element}`);
            this.functionStack.push(keysSorted[element]);
        }
    }


    /**
    * Defines library and test original code
    */
    SetLibrary(library: Library, cb: (sucess: boolean) => void) {

        this._lib = library;
        this.Original = this.CreateOriginalFromLibraryConfiguration(library);
        //Indexa os nós da AST usando o uuidv1();
        this._astExplorer.IndexNodesGUID(this.Original);
        this.bestIndividual = this.Original.Clone();

        //ByFunction, Global, static and dynamic
        if (this.nodesSelectionApproach == "ByFunction") {
            this.MakeFunctionList();
            this._logger.Write(`Funções para Otimizar: ${this.functionStack.length}`);
        }
        else {
            this._logger.Write(`Otimização global (todo o código da biblioteca)!`);
        }

        this.Test(this.Original, (testedOriginal) => {
            this.Original = testedOriginal;

            //this._logger.Write(`Orginal results: ${this.Original.testResults}`);

            if (!this.Original || !this.Original.testResults || !this.Original.testResults.passedAllTests) {
                this._logger.Write(`[IHeuristic] Failed to execute tests for ${library.name}`);
                cb(false);
            }
            else {
                //Force Best
                this.bestFit = this.Original.testResults.fit;
                this.bestIndividual = this.Original.Clone();

                this._logger.Write(`[IHeuristic] Original Fit ${this.bestFit}`);
                this._logger.Write('=================================');
                cb(true);
            }
        });

    }

    /**
    * Ranking estático de funções mais utilizadas no código
    */
    getFunctionStaticList(): Object {
        //must determine ranking of most used functions
        var types = require("ast-types");
        var localCount = {};

        var caminho = __dirname.replace('build', '');
        var functionExtractor = require(caminho + '/function-extractor.js');
        var functions = functionExtractor.interpret(this.Original.AST);
        var temp = this.Original.ToCode();
        this._logger.Write(`Funções: ${functions.length}`);

        for (var i = 0; i < functions.length; i++) {
            var nome = functions[i].name;
            var total = temp.split('.' + nome).length;
            localCount[nome] = total - 1;
        }

        //console.log(`${JSON.stringify(localCount)}`);

        return localCount;
    }

    /**
    * Create the orginal individual from library settings
    */
    CreateOriginalFromLibraryConfiguration(library: Library): Individual {
        var file = `${library.path}/${library.mainFilePath}`;
        this._logger.Write(`Arquivo Original: ${file}`);
        return this._astExplorer.GenerateFromFile(file);
    }

    /**
    * Over websockets objects loose instance methods
    */
    Reload(context: OperatorContext): OperatorContext {
        return this._astExplorer.Reload(context);
    }

    /**
    * Control the list of available Hosts
    */
    private DetermineNextHosts(): Array<string> {
        return this.Hosts;
    }

    /**
    * To resolve a single comunication with server trougth cluster comunication
    */
    getResponse(msg: Message, cb: (msgBack: Message) => void) {
        var didIT = this.SaveMessage(msg, cb);
        //this._logger.Write(`[IHeuristic] Messagem foi salva? ${didIT}`);
        if (didIT) {
            //============================================ Pool -> clients
            try {
                this.Pool.enqueue(JSON.stringify(msg), (err, obj) => {
                    try {
                        if (err) {
                            this._logger.Write(`[IHeuristic] Pool err: ${err.stack}`);
                            this.FinishMessage(msg.id, undefined);
                        }
                        else {
                            var processedMessage = obj.stdout;
                            processedMessage.ctx = this.Reload(processedMessage.ctx);

                            if (this.cbs[msg.id] != undefined) {
                                this.FinishMessage(msg.id, processedMessage);
                                //this._logger.Write(`[IHeuristic] Message ${msg.id} done.`);
                            }
                            else {
                                this._logger.Write(`[IHeuristic] Message ${msg.id} has timeoud and client has done now [FIT LOST: ${processedMessage.ctx.First.testResults.fit}]`);
                                //this._logger.Write(`[IHeuristic] Message ${msg.id} has timeoud and client has done now.`);
                            }
                        }
                    } catch (error) {
                        this._logger.Write(`[IHeuristic] Pool fail: ${error.stack}`);
                        this.FinishMessage(msg.id, undefined);
                    }
                });
            } catch (error) {
                this._logger.Write(`[IHeuristic] Pool err: ${error.stack}`);
                this.FinishMessage(msg.id, undefined);
            }
            //============================================ Done
        }
    }

    /**
    * Terminate a message Life cycle
    */
    FinishMessage(idForCB: number, messageDone: Message) {
        /*
        var hosts: Array<string> = <Array<string>>this.Messages[idForCB].Hosts;
        hosts.forEach(element => {
            this.Hosts.push(element);
        });
        */

        try {
            var cbReal = this.cbs[idForCB];

            delete this.cbs[idForCB];
            delete this.Messages[idForCB];

            this._logger.Write(`[IHeuristic] Messages: ${Object.keys(this.Messages).length}`);
            this._logger.Write(`[IHeuristic] cbs: ${Object.keys(this.cbs).length}`);
            this._logger.Write(`[IHeuristic] Message ${idForCB} done`);

            cbReal(messageDone);
        } catch (error) {
            this._logger.Write(`[IHeuristic] FinishMessage err ${error}`);

            throw new Error("it has failed inside FinishMessage");

            //delete this.cbs[idForCB];
            //delete this.Messages[idForCB];
        }
    }

    /**
    * Store a Message
    */
    SaveMessage(messageToSave: Message, cb: any): boolean {
        var result = false;

        try {
            messageToSave.id = this.nextId++;
            messageToSave.Hosts = this.DetermineNextHosts();
            messageToSave.ActualLibrary = this._lib.name;

            this.cbs[messageToSave.id] = cb;
            this.Messages[messageToSave.id] = messageToSave;

            this.DetermineMessageTimeout(messageToSave);
            result = true;

        } catch (error) {

            this._logger.Write(`[IHeuristic] SaveMessage error ${error}`);

            delete this.cbs[messageToSave.id];
            delete this.Messages[messageToSave.id];

            cb(undefined);
        }

        return result;
    }

    /**
    * Calculates Message Tmeout
    */
    DetermineMessageTimeout(messageToWait: Message) {
        var timeForTimeout = (this._globalConfig.clientTimeout * 1000);

        if (messageToWait.FirstOne !== undefined && messageToWait.FirstOne == true) {
            //In this case can be a file Long Copy
            timeForTimeout = this._globalConfig.copyFileTimeout * 1000;
            this._logger.Write(`[IHeuristic] File Copy Timeout ${timeForTimeout}`);
        }

        setTimeout(() => {
            var messageTimeouted = this.Messages[messageToWait.id];

            if (messageTimeouted) {
                this._logger.Write(`[IHeuristic] timeout for Message ${messageToWait.id}`);
                this.FinishMessage(messageToWait.id, undefined);
                this._logger.Write(`[IHeuristic] timeout for Message ${messageToWait.id} done`);
            }

        }, timeForTimeout);
    }

}

export default IHeuristic;