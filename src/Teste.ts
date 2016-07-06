/// <reference path="./typings/tsd.d.ts" />
//	node build/src/teste.js


import IConfiguration from '../src/IConfiguration';
import Individual from '../src/Individual';
import ASTExplorer from '../src/ASTExplorer';
import LogFactory from '../src/LogFactory';
import TestResults from './TestResults';

import fs = require('fs');
import path = require('path');

var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var lib = configuration.libraries[0];

var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);


//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    logger.Write(`tmpDirectory : ${configuration.tmpDirectory}`);
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

logger.Write(`process.platform : ${process.platform}`);
logger.Write(`process.env['TMPDIR'] : ${process.env['TMPDIR']}`);
logger.Write(`PBS_O_WORKDIR : ${process.env['PBS_O_WORKDIR']}`);
logger.Write(`ENV : ${JSON.stringify(process.env)}`);

