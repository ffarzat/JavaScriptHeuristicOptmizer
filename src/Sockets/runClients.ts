/**
 * Starts the client of Improvment Process based on configFile [Configuration.Json]
 * 
 * 
 * node --expose-gc --max-old-space-size=2047 build/src/Sockets/runClients.js
 * 
 */
import IConfiguration from '../IConfiguration';
import Optmizer from '../Optmizer';
import LogFactory from '../LogFactory';
import Server from './Server';
import Message from './Message';
import Client from './Client';
import OperatorContext from '../OperatorContext';
import Individual from '../Individual';

import WebSocket = require('ws');
import cluster = require('cluster');
import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');

var uuid = require('node-uuid');
var tmp = require('temporary');
var fse = require('fs-extra');
var rmdir = require('rmdir');
//=========================================================================================== Read Configuration values
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();
var numCPUs = (require('os').cpus().length);
//========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

logger.Write(`tmpDirectory : ${configuration.tmpDirectory}`);
logger.Write(`process.env['TMPDIR'] : ${process.env['TMPDIR']}`);
logger.Write(`process.platform : ${process.platform}`);