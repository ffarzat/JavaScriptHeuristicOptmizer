/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import WebSocketServer = require('ws');

import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';
import Library from '../Library';

import Individual from '../Individual';

/**
 * Client representaion on Server
 */
export default class Client{
    connection: WebSocketServer;
    id: string
    available: boolean;
    logger: ILogger;
    _astExplorer: ASTExplorer = new ASTExplorer();
    
    /**
     * Over websockets objects loose instance methods
     */
    Reload(context:OperatorContext){
        return this._astExplorer.Reload(context);
    }
    
    /**
     *  Releases a Mutation over context 
     */
    Mutate(context: OperatorContext): OperatorContext{
        this.logger.Write(`[Client:${this.id}]Processing new Mutant`);
        this.Reload(context);
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
        this.Reload(context);
        var news = this._astExplorer.CrossOver(context);
        var ctx = new OperatorContext();
        ctx.First = news[0];
        ctx.Second = news[1];
        this.logger.Write(`[Client:${this.id}]CrossOver done.`);
        return ctx;
    }
}