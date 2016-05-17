/// <reference path="./typings/tsd.d.ts" />
//node --expose-gc build/src/teste.js


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

for (var index = 0; index < 200; index++) {
    population.push(individualOverTests.Clone());
    logger.Write(index.toString());
    //global.gc();
    //logger.Write(`Manual GC ${process.memoryUsage().heapTotal}`);
}


