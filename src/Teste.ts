/// <reference path="./typings/tsd.d.ts" />
//node build/src/teste.js

import IConfiguration from '../src/IConfiguration';
import Individual from '../src/Individual';
import ASTExplorer from '../src/ASTExplorer';
import LogFactory from '../src/LogFactory';
import TestResults from './TestResults';

import fs = require('fs');
import path = require('path');

var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var lib = configuration.libraries[1];

var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

var astExplorer: ASTExplorer = new ASTExplorer();

var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);

var population: Individual[] = [];

for (var index = 0; index < 10000; index++) {
    var newOne = individualOverTests.Clone();
    //CreateFakeResults(newOne);
    population.push(newOne);
    logger.Write(index.toString());
}

//logger.Write(individualOverTests.AST);


/**
 * Create a fake test result
 */
function CreateFakeResults(newIndividual: Individual):void {
    
    var outputFake: string[] = [];
    
    for (var index = 0; index < 4; index++) {
        outputFake.push(newIndividual.AST); //lot of string
    }
    
    
    var results: TestResults = new TestResults();
    results.rounds = 5;

    results.min = 0;
    results.max = 0;
    results.mean = 0;
    results.median = 0;
    results.duration = 0;
    results.outputs = outputFake;
    results.fit = 0;
    results.passedAllTests = false;
    
    newIndividual.testResults = results;
}


