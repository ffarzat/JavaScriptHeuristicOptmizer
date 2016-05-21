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

//=========================================================================================== Read Configuration values
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();

//========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

//=========================================================================================== Cluster
var numCPUs = 2;
if (cluster.isMaster) {
    var i = 0
    for (i = 0; i < numCPUs; i++) {
        logger.Write(`Fork: ${i}`);
        var slave = cluster.fork();
    }

    slave.on('disconnect', function (worker) {
        i++;
        logger.Write(`[runClient]Start new client from disconnect event`);
        logger.Write(`Fork: ${i}`);
        cluster.fork();
    });


} else {
    //=========================================================================================== Slave
    var clientWorkDir: string = new tmp.Dir().path;
    process.setMaxListeners(0);

    //=========================================================== Libs initialization

    ParseConfigAndLibs(clientWorkDir);

    //=========================================================== Client initialization
    var clientId = uuid.v4();
    var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + clientId;
    logger.Write(`[Client:${clientId}] conecting at ${serverUrl}`);

    var localClient = new Client();
    localClient.id = clientId;
    localClient.logger = logger;

    localClient.Setup(configuration);
    try {
        var ws = new WebSocket(serverUrl, 'echo-protocol');

        ws.addEventListener("message", (e) => {
            var msg: Message = JSON.parse(e.data);

            msg.ctx = localClient.Reload(msg.ctx);

            if (msg.ctx.Operation == "Mutation") {
                msg.ctx = localClient.Mutate(msg.ctx);
            }

            if (msg.ctx.Operation == "MutationByIndex") {
                msg.ctx = localClient.MutateBy(msg.ctx);;
            }

            if (msg.ctx.Operation == "CrossOver") {
                msg.ctx = localClient.CrossOver(msg.ctx);
            }

            if (msg.ctx.Operation == "Test") {
                var newCtx = localClient.Test(msg.ctx);
                msg.ctx = newCtx;
            }

            var msgProcessada = JSON.stringify(msg);
            ws.send(msgProcessada);
        });
    }
    catch (err) {
        logger.Write(`--> ${err}`);
        process.abort();
    }
}

//=========================================================================================== Functions
function ParseConfigAndLibs(workDir: string) {
    for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
        var element = configuration.libraries[libIndex];
        var libDirectoryPath = path.join(process.cwd(), element.path);
        var libNodeModules = path.join(libDirectoryPath, "node_modules");
        var tempLibPath = path.join(workDir, element.name);
        try {
            if (!fs.existsSync(libNodeModules)) {
                process.chdir(libDirectoryPath);
                var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec(`npm install`, { silent: true }) as Shell.ExecOutputReturnValue);

                if (returnedOutput.code > 0) {
                    logger.Write(`Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
                    configuration.libraries.splice(libIndex, 1);
                }
                else {
                    logger.Write(`Library ${element.name} instaled successfully`);
                }
            }

            if (!fs.existsSync(tempLibPath)) {
                logger.Write(`Copying ${element.name} to ${tempLibPath}`);
                fs.mkdirSync(tempLibPath);
                fse.copySync(libDirectoryPath, tempLibPath, { "clobber": true, "filter": function () { return true; } });
                //in order to test

                element.mainFilePath = path.join(tempLibPath, JSON.parse(fs.readFileSync(path.join(tempLibPath, "package.json")).toString()).main); //new main file path
                element.path = tempLibPath;
                //logger.Write(`  Updating element.mainFilePath : ${element.mainFilePath}`);
                //logger.Write(`  Updating  element.path ${element.path}`);
            }

        } catch (error) {
            logger.Write(`-->${error}`);
        }
        finally {
            process.chdir(testOldDirectory);
        }
    }
}