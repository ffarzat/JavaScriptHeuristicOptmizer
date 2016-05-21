/// <reference path="../../src/typings/tsd.d.ts" />

import Client from '../../src/sockets/Client';
import Server from '../../src/sockets//Server';
import Message from '../../src/sockets//Message';

import OperatorContext from '../../src/OperatorContext';
import Individual from '../../src//Individual';

import IConfiguration from '../../src/IConfiguration';
import LogFactory from '../../src/LogFactory';
import ASTExplorer from '../../src/ASTExplorer';

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

var uuid = require('node-uuid');

describe('Client Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should Test Time-limit a function', async function () {

        var p = new Promise<OperatorContext>(function (resolve, reject) {
            console.log('Begin');
            
            setTimeout(function() {
                console.log('timeout');
                reject(new Error('time out!'));
            }, 50);
            
            
            setTimeout(function() {
                console.log('timeout');
                var ctx = new OperatorContext();
                ctx.Operation == 'foo';
                resolve(ctx);
            }, 13);
        });
        
        var newctx = await Promise.resolve(p);
        expect(newctx.Operation).to.be('Foo');
        console.log('ending');
    });

    it('Should Test uuid lib', function () {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
        var libFile: string = lib.mainFilePath;

        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);

        var astExplorer: ASTExplorer = new ASTExplorer();
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var clientId = uuid.v4();

        var msg: Message = new Message();
        var context = new OperatorContext();
        context.Operation = "Test";
        context.First = generatedIndividual;
        context.Second = this.bestIndividual; //is usual to be the original
        context.LibrarieOverTest = lib;

        msg.ctx = context;

        var localClient = new Client();
        localClient.id = clientId;
        localClient.logger = logger;
        localClient.Setup(configuration);

        var newCtx = localClient.Test(msg.ctx);

        expect(newCtx.First.testResults.passedAllTests).to.be(true);
        expect(newCtx.First.testResults).not.to.be(undefined);
        expect(newCtx.First.testResults.duration).not.to.be(undefined);
        expect(newCtx.First.testResults.min).not.to.be(undefined);
        expect(newCtx.First.testResults.max).not.to.be(undefined);
        expect(newCtx.First.testResults.mean).not.to.be(undefined);
        expect(newCtx.First.testResults.median).not.to.be(undefined);
        expect(newCtx.First.testResults.outputs).not.to.be(undefined);
        expect(newCtx.First.testResults.passedAllTests).not.to.be(undefined);
        expect(newCtx.First.testResults.rounds).not.to.be(undefined);
    });
});

