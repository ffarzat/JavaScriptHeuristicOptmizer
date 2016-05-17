/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import WebSocketServer = require('ws');
import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';
import Library from '../Library';
import ITester from '../ITester';
import TesterFactory from '../TesterFactory';
import Individual from '../Individual';

/**
 * Client representaion on Server
 */
export default class Client{
    connection: WebSocketServer;
    id: string
    available: boolean;
    logger: ILogger;
    _tester: ITester;
    _astExplorer: ASTExplorer = new ASTExplorer();
    _config: IConfiguration;
    
    Setup(config: IConfiguration): void {
        this._config = config;
    }
    
    /**
     * Over websockets objects loose instance methods
     */
    Reload(context:OperatorContext): OperatorContext{
        return this._astExplorer.Reload(context);
    }
    
    /**
     *  Releases a Mutation over context 
     */
    Mutate(context: OperatorContext): OperatorContext{
        this.logger.Write(`[Client:${this.id}]Processing new Mutant`);
        
        var newIndividual = this._astExplorer.Mutate(context);
        var ctx = new OperatorContext();
        ctx.First = newIndividual;
        this.logger.Write(`[Client:${this.id}]Mutant done.`);
        return ctx;
    }
    
    /**
    * Releases a mutation over an AST  by nodetype and index
    */
    MutateBy(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client:${this.id}]Processing new Mutant [Index]`);
        this.Reload(context);
        var newIndividual = this._astExplorer.MutateBy(context);
        var ctx = new OperatorContext();
        ctx.First = newIndividual;
        this.logger.Write(`[Client:${this.id}]Mutant done.`);
        return ctx;
    }
        
    /**
     *  Releases a Crossover operation 
     */
    CrossOver(context: OperatorContext): OperatorContext{
        this.logger.Write(`[Client:${this.id}]Processing new CrossOver`);
        
        var news = this._astExplorer.CrossOver(context);
        var ctx = new OperatorContext();
        ctx.First = news[0];
        ctx.Second = news[1];
        this.logger.Write(`[Client:${this.id}]CrossOver done.`);
        return ctx;
    }
    
    /**
     * Global distributed Test execution
     */
    Test(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client:${this.id}]Executing Tests for ${context.LibrarieOverTest.name}`);

        this.InitializeTester(context);
        
        this._tester.Test(context.First); //First is subject
        
        //this._tester.Test(context.Second); //Second is the original!!!!
        
        var ctx = new OperatorContext();
        ctx.First = context.First;
        this.logger.Write(`[Client:${this.id}]Test done.`);
        return ctx;
    }
    
     /**
     * Initializes configurated Tester class
     */
    private InitializeTester(context: OperatorContext) {
        this._tester = null; //ensure GC can pass
        
        this._tester = new TesterFactory().CreateByName(this._config.tester);
        this._tester.Setup(this._config.testUntil, context.LibrarieOverTest, this._config.fitType)
        this._tester.SetLogger(this.logger);
    }
}