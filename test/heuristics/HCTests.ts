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
        var lib = configuration.libraries[6]; //minimist
        var hc: HC = new HC();
        
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);
        //fse.writeFileSync(path.join(process.cwd(), "original.js"), individualOverTests.ToCode(), "UTF8" ); //saving file for comparsion purpose
        
        hc.Setup(configuration.trialsConfiguration[0].especific);
        
        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);
        hc._logger = logger;
        
        var tester = new TesterFactory().CreateByName(configuration.tester);
        tester.Setup(configuration.testUntil, lib, configuration.fitType);
        tester.SetLogger(logger);        
        
        tester.Test(individualOverTests); //test orginal
        
        
        hc._tester = tester;
        
        hc.mutationTrials = configuration.mutationTrials;
        
        var totalNodes = astExplorer.CountNodes(individualOverTests);
                
        hc.UpdateBest(individualOverTests);

        //====================>
        var mutant = individualOverTests.Clone();
        hc.MutateBy(mutant, "#IfStatement", 0);
        //fse.writeFileSync(path.join(process.cwd(), "mutant.js"), mutant.ToCode(), "UTF8");
        expect(mutant.AST).not.be.equal(individualOverTests.AST);
        //====================>
         var results = hc.RunTrial(0, individualOverTests);
         
         //expect(results).not.be.an('undefined');
         //expect(results.trial).to.be.equal(0);
    });
    
});