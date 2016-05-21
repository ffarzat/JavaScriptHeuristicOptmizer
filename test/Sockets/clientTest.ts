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
var snappy = require('snappy');

describe('Client Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should Compress lodash AST', async function () {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1]; 
        var libFile: string = lib.mainFilePath;
        var astExplorer: ASTExplorer = new ASTExplorer();
        
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        
        var compressed = snappy.compressSync(JSON.stringify(generatedIndividual.AST));
        var compressedBack = snappy.uncompressSync(compressed, { asBuffer: false });
        
        expect(JSON.stringify(generatedIndividual.AST).length).to.be.greaterThan(compressed.length);
        expect(JSON.stringify(generatedIndividual.AST)).to.be.equal(compressedBack);
        //fs.writeFileSync('ASTOriginal.txt', JSON.stringify(generatedIndividual.AST));
        //fs.writeFileSync('ASTCompacta.txt', compressed);
        
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

