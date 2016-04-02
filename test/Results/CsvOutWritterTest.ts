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

describe('CsvOutWritterTest Tests', () => {
    
    it('Should Setup write Results in Csv format', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        var concrete = new IOutWriterFactory().CreateByName(configuration.outWriter);
        concrete.Initialize(configuration);
        var fakeResult = new TrialResults();
        
        fakeResult.trial = 1;
        fakeResult.bestIndividualAvgTime = 1.69;
        fakeResult.bestIndividualCharacters = 15968;
        fakeResult.bestIndividualLOC = 68000;
        
        fakeResult.originalIndividualAvgTime = 2.1;
        fakeResult.originalIndividualCharacters = 16000
        fakeResult.originalIndividualLOC = 70000;
        fakeResult.best = new Individual();
        
        concrete.WriteTrialResults(fakeResult);
        
        expect(concrete).not.be.an('undefined');       
    });
    
})