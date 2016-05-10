/// <reference path="../../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import Individual from '../../src/Individual';
import IConfiguration from '../../src/IConfiguration';
import HC from '../../src/heuristics/HC';
import ASTExplorer from '../../src/ASTExplorer';
import LogFactory from '../../src/LogFactory';
import TesterFactory from '../../src/TesterFactory';
import fse = require('fs-extra');

describe('HC Tests', function() {
    
    this.timeout(60*10*1000);//ten minutes
    
    it('Should creates an instance', function() {
        var hc: HC = new HC();
        expect(hc).not.be.a('undefined');
    });
    
    it('Should Iterate Based on config', function () {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1]; //uuid
        var hc: HC = new HC();
        
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);
        //fse.writeFileSync(path.join(process.cwd(), "original.js"), individualOverTests.ToCode(), "UTF8" ); //saving file for comparsion purpose
        
        hc.Setup(configuration.trialsConfiguration[0].especific);
        
        expect(hc.trials).to.be.equal(3);
        expect(hc.neighborApproach).to.be.equal("FirstAscent");
        expect(hc.restart).to.be.equal(true);
        expect(hc.nodesType.length).to.be.equal(2);
        expect(hc.nodesType[0]).to.be.equal("CallExpression");
        expect(hc.nodesType[1]).to.be.equal("IfStatement");

        
        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);
        hc._logger = logger;
        
        var tester = new TesterFactory().CreateByName(configuration.tester);
        tester.Setup(configuration.testUntil, lib, configuration.fitType);
        tester.SetLogger(logger);        
        
        tester.Test(individualOverTests); //test orginal
        
        
        hc._tester = tester;
        
        hc.mutationTrials = configuration.mutationTrials;
        hc.crossOverTrials = configuration.crossOverTrials;
        
        var totalNodes = astExplorer.CountNodes(individualOverTests);
        hc.bestFit = individualOverTests.testResults.median;
        hc.bestIndividual = individualOverTests;
        
        var itHasRestarted = false;
        hc.on('Restart', ()=>{
             itHasRestarted = true;   
        });
        
        //====================>
        hc.SetLibrary(lib);
        hc.RunTrial(0).then( (results)=> {
            expect(results).not.be.an('undefined');
            expect(results.trial).to.be.equal(0);
            expect(itHasRestarted).to.be.equal(true);
        });
    });
    
});