/// <reference path="../../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import Individual from '../../src/Individual';
import IConfiguration from '../../src/IConfiguration';
import GA from '../../src/heuristics/GA';
import ASTExplorer from '../../src/ASTExplorer';
import LogFactory from '../../src/LogFactory';
import TesterFactory from '../../src/TesterFactory';

describe('GA Tests', function() {
    
    this.timeout(60*10*1000);//ten minutes
    
    it('Should creates an instance', function() {
        var ga: GA = new GA();
        expect(ga).not.be.a('undefined');
    });
    
    it('Should Creates a new Population Based on config', function () {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[6]; //uuid
        var ga: GA = new GA();
        
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);
        
        ga.Setup(configuration.trialsConfiguration[0].especific);
        
        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);
        ga._logger = logger;
        
        var tester = new TesterFactory().CreateByName(configuration.tester);
        tester.Setup(configuration.testUntil, lib, configuration.fitType);
        tester.SetLogger(logger);        
        
        tester.Test(individualOverTests); //test orginal
        tester.SetLogger(logger);
        
        ga._tester = tester;
        
        ga.mutationTrials = configuration.mutationTrials;
        ga.crossOverTrials = configuration.crossOverTrials;
        
        var totalNodes = astExplorer.CountNodes(individualOverTests);
        ga.bestFit = individualOverTests.testResults.median;
        ga.bestIndividual = individualOverTests;
        //====================>
        
        var results = ga.RunTrial(0, individualOverTests);
        
        expect(results).not.be.an('undefined');
        expect(results.trial).to.be.equal(0);
    });
    
    
})