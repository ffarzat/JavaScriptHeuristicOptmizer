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

import fs = require('fs');

/**
 * Client representaion on Server
 */
export default class Client {
    connection: WebSocketServer;
    id: string
    available: boolean;
    logger: ILogger;
    _tester: ITester;
    _astExplorer: ASTExplorer = new ASTExplorer();
    _config: IConfiguration;

    clientPath: string;

    TempDirectory: any;

    HostsAvailable: Array<string>;

    Setup(config: IConfiguration, directory: any): void {
        this._config = config;
        this.TempDirectory = directory;
    }

    /**
     * Over websockets objects loose instance methods
     */
    Reload(context: OperatorContext): OperatorContext {
        return this._astExplorer.Reload(context);
    }

    SetHosts(hosts: Array<string>) {
        this.HostsAvailable = hosts;
    }

    /**
     *  Releases a Mutation over context 
     */
    Mutate(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client ${this.id}]Processing new Mutant`);

        var ctx = new OperatorContext();

        try {
            var newIndividual = this._astExplorer.Mutate(context);

            if ((newIndividual.ToCode() != context.Original.ToCode())) {
                this.logger.Write(`[Client ${this.id}]  Testing new mutant`);
                this.InitializeTester(context);
                this._tester.Test(newIndividual);
                this.logger.Write(`[Client ${this.id}]  Tests done.`);
            } else {
                newIndividual = context.Original.Clone();
                this.logger.Write(`[Client ${this.id}]  New mutant Fail`);
            }

            ctx.First = newIndividual;

        } catch (err) {
            this.logger.Write(`[Client ${this.id}]Error: ${err}`);
            newIndividual = context.Original.Clone();
            ctx.First = newIndividual;
        }

        this.logger.Write(`[Client ${this.id}]Mutant done.`);
        return ctx;
    }

    /**
    * Releases a mutation over an AST  by nodetype and index
    */
    MutateBy(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client ${this.id}]Processing new Mutant [Index]`);

        var ctx = new OperatorContext();

        try {

            var newIndividual = this._astExplorer.MutateBy(context);

            if ((newIndividual.ToCode() != context.Original.ToCode())) {
                this.logger.Write(`[Client ${this.id}]  Testing new mutant`);
                //this.logger.Write(`[Client]  ${context.clientPath}`);
                this.InitializeTester(context);
                this._tester.Test(newIndividual);
                this.logger.Write(`[Client ${this.id}]  Tests done.`);
            } else {
                newIndividual = context.Original.Clone();
                this.logger.Write(`[Client ${this.id}]  New mutant Fail`);
            }


            ctx.First = newIndividual;

        }
        catch (err) {
            this.logger.Write(`[Client ${this.id}]Error: ${err}`);
            newIndividual = context.Original.Clone();
            ctx.First = newIndividual;
        }

        this.logger.Write(`[Client ${this.id}]Mutant done.`);
        return ctx;
    }

    /**
     *  Releases a Crossover operation 
     */
    CrossOver(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client ${this.id}]Processing new CrossOver`);
        var ctx = new OperatorContext();

        try {
            var news = this._astExplorer.CrossOver(context);


            if ((news[0].ToCode() != context.Original.ToCode())) {
                this.logger.Write(`[Client ${this.id}]  Testing First son`);
                this.InitializeTester(context);
                this._tester.Test(news[0]);
                this.logger.Write(`[Client ${this.id}]  Tests done.`);
            } else {
                news[0] = context.Original.Clone();
                this.logger.Write(`[Client ${this.id}]  First Fail`);
            }

            if (!(news[1].ToCode() === context.Original.ToCode())) {
                this.logger.Write(`[Client ${this.id}]  Testing Second son`);
                this.InitializeTester(context);
                this._tester.Test(news[1]);
                this.logger.Write(`[Client ${this.id}]  Tests done.`);
            } else {
                news[1] = context.Original.Clone();
                this.logger.Write(`[Client ${this.id}]  Second Fail`);
            }


            ctx.First = news[0];
            ctx.Second = news[1];
        }
        catch (err) {
            this.logger.Write(`[Client ${this.id}]Error: ${err}`);

            ctx.First = context.Original.Clone();
            ctx.Second = context.Original.Clone();
        }

        this.logger.Write(`[Client ${this.id}] CrossOver done.`);
        return ctx;
    }

    /**
     * Global distributed Test execution
     */
    Test(context: OperatorContext): OperatorContext {
        this.logger.Write(`[Client ${this.id}] Executing Tests for ${context.LibrarieOverTest.name}`);

        var ctx = new OperatorContext();


        try {
            this._config.clientTimeout = this._config.clientTimeout;
            this.InitializeTester(context);
            this._tester.Test(context.First); //First is subject
            //this._tester.Test(context.Second); //Second is the original!!!!
            ctx.First = context.First;
        }
        catch (err) {
            this.logger.Write(`[Client ${this.id}] ${err.stack}`);
            ctx.First = context.Original.Clone();
        }


        //Original time is now the timeout for everyone else (already in MS)
        this.logger.Write(`[Client ${this.id}] Test done.`);
        return ctx;
    }


    /**
    * Initializes configurated Tester class
    */
    private InitializeTester(context: OperatorContext) {

        this._tester = null; //ensure GC can pass

        //change lib path for clientWorkDir!
        this._config.libraries.forEach(element => {
            if (element.name === context.LibrarieOverTest.name) {
                context.LibrarieOverTest = element;
                context.LibrarieOverTest.path = `${this.TempDirectory}/${context.LibrarieOverTest.name}`;
                context.LibrarieOverTest.mainFilePath = `${this.TempDirectory}/${context.LibrarieOverTest.name}/${context.LibrarieOverTest.mainFilePath}`;
            }
        });

        this.logger.Write(`[Client ${this.id}] Test lib environment: ${context.LibrarieOverTest.name}`)
        this._tester = new TesterFactory().CreateByName(this._config.tester);
        this._tester.Setup(this._config.testUntil, context.LibrarieOverTest, this._config.fitType, this._config.clientTimeout * 1000, this.HostsAvailable, context.MemoryToUse, context.clientPath);
        this._tester.SetLogger(this.logger);
    }
}