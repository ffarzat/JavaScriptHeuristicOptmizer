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
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);
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


//=========================================================================================== Cluster
if (cluster.isMaster) {
    logger.Write(`[runClients] process.platform : ${process.platform}`);
    logger.Write(`[runClients] configurationFile: ${configurationFile}`);
    logger.Write(`[runClients] process.env['TMPDIR'] : ${process.env['TMPDIR']}`);
    logger.Write(`[runClients] CPUS Available on host: ${numCPUs}`);
    logger.Write(`[runClients] Clients to launch: ${configuration.clientsTotal}`);
    logger.Write(`[runClients] Operation Timeout: ${(configuration.clientTimeout)} secs`)
    //logger.Write(`[runClients] Creating ${configuration.clientsTotal} Clients`)
    

    var i = 0
    for (i = 0; i < configuration.clientsTotal; i++) {
        cluster.fork();
        logger.Write(`Fork: ${i}`);
    }

    cluster.on('exit', function (deadWorker, code, signal) {

        if (code != 0) {
            // Restart the worker
            var worker = cluster.fork();

            // Note the process IDs
            var newPID = worker.process.pid;
            var oldPID = deadWorker.process.pid;

            // Log the event
            console.log('[runClient] worker ' + oldPID + ' died.');
            console.log('[runClient] worker ' + newPID + ' born.');
        }
    });

} else {
    //=========================================================================================== Slave
    process.stdin.resume();

    var clientWorkDir = new tmp.Dir();

    //logger.Write(`clientWorkDir : ${clientWorkDir.path}`);

    //process.setMaxListeners(0);

    //=========================================================== Libs initialization

    ParseConfigAndLibs(clientWorkDir.path);

    //=========================================================== Client initialization
    var clientId = uuid.v4();
    var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + clientId;
    logger.Write(`[Client:${clientId}] conecting at ${serverUrl}`);

    var localClient = new Client();
    localClient.id = clientId;
    localClient.logger = logger;

    localClient.Setup(configuration, clientWorkDir, 1, "");

    ExecuteOperations(localClient);
}
//=========================================================================================== //======>
//=========================================================================================== Functions
function runGC() {
    if (typeof global.gc != "undefined") {
        //logger.Write(`Mem Usage Pre-GC ${process.memoryUsage().heapTotal}`);
        //global.gc();
        //console.log(`Mem Usage ${formatBytes(process.memoryUsage().heapTotal, 2)}`);
    }
}

/**
 * Format for especific size
 */
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function ExecuteOperations(clientLocal: Client) {
    let timeoutId;
    let promisedId;

    const delay = new Promise<OperatorContext>((resolve, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('timeout'));
        }, configuration.clientTimeout * 1000);
    });

    let operationPromise: Promise<OperatorContext>;

    var ws = new WebSocket(serverUrl, 'echo-protocol'); //conect

    ws.addEventListener("close", (data) => {
        logger.Write(`[runClient]Client ${localClient.id} clean temp data...`);

        rmdir(clientLocal.TempDirectory.path, function (err, dirs, files) {
            //console.log(dirs);
            //console.log(files);
            //console.log('all files are removed');
            logger.Write(`[runClient]Client ${localClient.id}   Temp data cleaned.`);
            logger.Write(`[runClient]Client ${localClient.id} Done.`);
            process.exit(0);
        });

    });

    ws.addEventListener("error", (data) => {
        logger.Write(`[runClient]Client ${localClient.id} clean temp data...`);

        rmdir(clientLocal.TempDirectory.path, function (err, dirs, files) {
            //console.log(dirs);
            //console.log(files);
            //console.log('all files are removed');
            logger.Write(`[runClient]Client ${localClient.id}   Temp data cleaned.`);
            logger.Write(`[runClient]Client ${localClient.id} Done.`);
            process.exit(101010);
        });

    });

    ws.addEventListener("ping", () => {
        ws.pong();
    });


    ws.addEventListener("message", async (e) => {

        try {

            var msg: Message = JSON.parse(e.data);
            //logger.Write(`[runClient] msg ${msg.ctx.First._astFile.path}`);
            msg.ctx = clientLocal.Reload(msg.ctx);
            logger.Write(`[runClient]Client ${localClient.id} processing message ${msg.id}`);

            if (msg.ctx.Operation == "Mutation") {
                operationPromise = new Promise<OperatorContext>((resolve) => {
                    promisedId = setTimeout(() => {
                        resolve(clientLocal.Mutate(msg.ctx));
                    }, 13);
                });
            }

            if (msg.ctx.Operation == "MutationByIndex") {
                operationPromise = new Promise<OperatorContext>((resolve) => {
                    promisedId = setTimeout(() => {
                        resolve(clientLocal.MutateBy(msg.ctx));
                    }, 13);
                });
            }

            if (msg.ctx.Operation == "CrossOver") {
                operationPromise = new Promise<OperatorContext>((resolve) => {
                    promisedId = setTimeout(() => {
                        resolve(clientLocal.CrossOver(msg.ctx));
                    }, 13);
                });
            }

            if (msg.ctx.Operation == "Test") {
                operationPromise = new Promise<OperatorContext>((resolve) => {
                    promisedId = setTimeout(() => {
                        resolve(clientLocal.Test(msg.ctx));
                    }, 13);
                });
            }

            msg.ctx = await Promise.race([delay, operationPromise]);
            clearTimeout(timeoutId);

            var msgProcessada = JSON.stringify(msg);
            logger.Write(`[runClients] Msg ${msg.id} done.`);
            ws.send(msgProcessada); //send back the result
        }
        catch (err) {
            clearTimeout(promisedId);
            logger.Write(`[runClient]Client error: ${err}`);
            logger.Write(`[runClient]Client ${localClient.id} disconneting...`);

            ws.close();

            process.exit(111111);
        }

        runGC();

    });
}

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
                    logger.Write(`[runClient] Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
                    configuration.libraries.splice(libIndex, 1);
                }
                else {
                    logger.Write(`[runClient] Library ${element.name} instaled successfully`);
                }
            }

            if (!fs.existsSync(tempLibPath)) {
                logger.Write(`[runClient] Copying ${element.name} to ${tempLibPath}`);
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