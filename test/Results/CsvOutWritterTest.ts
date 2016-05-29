/// <reference path="../../src/typings/tsd.d.ts" />
import expect = require('expect.js');

import fs = require('fs');
import path = require('path');

import IConfiguration from '../../src/IConfiguration';
import CsvResultsOutWriter from '../../src/Results/CsvResultsOutWriter';
import IOutWriter from '../../src/IOutWriter';
import Individual from '../../src/Individual';
import IOutWriterFactory from '../../src/IOutWriterFactory';
import TrialResults from '../../src/Results/TrialResults';
import ASTExplorer from '../../src/ASTExplorer';
import IHeuristic from '../../src/heuristics/IHeuristic';
import HeuristicFactory from '../../src/heuristics/HeuristicFactory';
import HC from '../../src/heuristics/HC';

describe('CsvOutWritterTest Tests', function () {
    
    this.timeout(60*10*1000); //10 minutes
    
    it('Should Setup write Results in Csv format', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var concrete = new IOutWriterFactory().CreateByName(configuration.outWriter);
        var hcInstance: HC  = new HeuristicFactory().CreateByName(configuration.heuristics[2]) as HC;
        
        hcInstance.Name = "HC";
        configuration.logFileClearing = false; //just here for testing purpose
        concrete.Initialize(configuration, configuration.libraries[0], hcInstance);
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var generatedAST: Individual = astExplorer.GenerateFromFile(configuration.libraries[0].mainFilePath);
        
        var fakeResult = new TrialResults();
        
        fakeResult.trial = 1;
        fakeResult.bestIndividualAvgTime = 1.69;
        fakeResult.bestIndividualCharacters = 15968;
        fakeResult.bestIndividualLOC = 68000;
        fakeResult.best = generatedAST.Clone();
        
        fakeResult.originalIndividualAvgTime = 2.1;
        fakeResult.originalIndividualCharacters = 16000
        fakeResult.originalIndividualLOC = 70000;
        fakeResult.original = generatedAST.Clone();
        
        concrete.WriteTrialResults(fakeResult);
        
        fakeResult.trial = 2;
        fakeResult.bestIndividualAvgTime = 2.69;
        fakeResult.bestIndividualCharacters = 25968;
        fakeResult.bestIndividualLOC = 28000;
        fakeResult.best = generatedAST.Clone();
        
        fakeResult.originalIndividualAvgTime = 2.1;
        fakeResult.originalIndividualCharacters = 26000
        fakeResult.originalIndividualLOC = 20000;
        fakeResult.best = generatedAST.Clone();
                
        concrete.WriteTrialResults(fakeResult);
                
        expect(concrete).not.be.an('undefined');       
    });
    
})