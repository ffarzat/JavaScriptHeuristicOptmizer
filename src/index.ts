/**
 * Starts the Improvment Process based on cofigFile [Configuration.Json]
 */
import IConfiguration from './IConfiguration';
import Optmizer from './Optmizer';
import LogFactory from './LogFactory';

import Server from './Sockets/Server';
import Message from './Sockets/Message';

import cluster = require('cluster');
import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');
var optmizer: Optmizer = undefined;
var localServer: Server = new Server();

//=========================================================================================== Reads config
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';  
var configurationFile: string = path.join(process.cwd(), configFile);

var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

//=========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);
//process.setMaxListeners(0);
//=========================================================================================== Server!


/*
if (cluster.isMaster) {
    console.log (`[index]configurationFile: ${configurationFile}`);
    localServer.logger = logger;
    localServer.Setup(configuration);
    //setInterval(function () { localServer.ProcessQueue(); }, 100); //1x per 3 second
    //setInterval(function () { localServer.ProcessRetun(); }, 100); //1x per 3 second

    //setInterval(function () { localServer.Status(); }, 10000);

    var optmizerWorker = cluster.fork(); //optmizer worker

    optmizerWorker.on('message', (msg: Message) => {

        localServer.ActualHeuristic = msg.ActualHeuristic
        localServer.ActualGlobalTrial = msg.ActualGlobalTrial
        localServer.ActualInternalTrial = msg.ActualInternalTrial
        localServer.ActualLibrary = msg.ActualLibrary


        if (msg.CleanServer == true) {
            logger.Write(`[index] CleanServer:${msg.CleanServer}`);
            localServer.CleanUp();
        }

        if (msg.Shutdown == true) {
            process.exit();
        }

        //logger.Write(`[index] Send to server. Msg : ${msg.id}`);

        localServer.DoAnOperation(msg, (newMsg) => {

            //logger.Write(`[index] Server done msg : ${msg.id}`);
            //logger.Write(`[index] ${msg.id} == ${newMsg.id} : ${msg.id === newMsg.id}`);

            optmizerWorker.send(newMsg);
        });
    });

 
    setInterval(function () {
        logger.Write(`[index.Master] workers: ${cluster.listeners.length}`);
    }, 1000);



} else {

    */
    logger.Write(`Initializing Optmizer for ${configuration.libraries.length} libraries`);
    logger.Write(`Preparing libs environment`);

    process.on('message', (newMsg: Message) => {
        Done(newMsg);
    });

    //Here is the Optmizer in another work
    //=========================================================================================== Just prepare all libs
    ParseConfigAndLibs();

    //=========================================================================================== Just for know

    DisplayConfig();

    //=========================================================================================== For all trials
    ExecuteTrials(configuration.startTrial);


//}
//=========================================================================================== Functions
function ExecuteTrials(globalTrial: number) {
    logger.Write(`============================= Optmizer Global trial: ${globalTrial}`);
    //var msg = new Message();
    //process.send(msg); //clean Server

    executeHeuristicTrial(globalTrial, configuration, 0, () => {
        logger.Write(`============================= Optmizer Global trial: ${globalTrial} Done!`);

        globalTrial++;
        if (globalTrial == configuration.trials) {
            logger.Write(`[index] All trials were executed`);
            //var shutdownMessage = new Message();
            //shutdownMessage.Shutdown = true;
            //process.send(shutdownMessage);
            process.exit();
        }
        else {
            ExecuteTrials(globalTrial);//next
        }
    });

}


function Done(message: Message) {
    optmizer.Done(message);
}

function executeHeuristicTrial(globalTrial: number, config: IConfiguration, heuristicTrial: number, cb: () => void) {

    optmizer = new Optmizer();

    optmizer.Setup(configuration, globalTrial, heuristicTrial);
    optmizer.DoOptmization(0,() => {
        cb();
    });
}

/**Executes forced GC */
function runGC() {
    if (typeof global.gc != "undefined") {
        logger.Write(`Mem Usage Pre-GC ` + process.memoryUsage());
        global.gc();
        logger.Write(`Mem Usage Post-GC ` + process.memoryUsage());
    }
}

function ParseConfigAndLibs() {
    for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
        var element = configuration.libraries[libIndex];
        try {
            var libDirectoryPath = path.join(process.cwd(), element.path);
            var libNodeModules = path.join(libDirectoryPath, "node_modules");
            if (fs.existsSync(libNodeModules)) {
                continue;
            }

            process.chdir(libDirectoryPath);
            var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec(`npm install`, { silent: true }) as Shell.ExecOutputReturnValue);

            if (returnedOutput.code > 0) {
                logger.Write(`Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
                configuration.libraries.splice(libIndex, 1);
            }
            else {
                logger.Write(`Library ${element.name} instaled successfully`);
            }

        } catch (error) {
            logger.Write(`${error}`);
        }
        finally {
            process.chdir(testOldDirectory);
        }
    }
}

function DisplayConfig() {
    var totalTrials = configuration.trials * configuration.trialsConfiguration.length * configuration.libraries.length * configuration.heuristics.length;
    logger.Write('=================================');
    logger.Write(`Clients total ${configuration.clientsTotal}`);
    logger.Write(`Tmp Dir [Config File] ${configuration.tmpDirectory}`);
    logger.Write(`Fit type [mean|median]:  ${configuration.fitType}`);
    logger.Write(`Number of testing each individual:  ${configuration.testUntil}`);
    logger.Write(`Logfile:  ${configuration.logFilePath}`);
    logger.Write(`Results directory:  ${configuration.resultsDirectory}`);
    logger.Write(`Total Trials:  ${configuration.trials}`);
    logger.Write(`Especific configuration:  ${configuration.trialsConfiguration.length}`);
    logger.Write(`Total libraries:  ${configuration.libraries.length}`);
    logger.Write(`Total heuristics:  ${configuration.heuristics.length}`);
    logger.Write(`Total runs [${configuration.trials} * ${configuration.trialsConfiguration.length} * ${configuration.libraries.length} * ${configuration.heuristics.length} ]:  ${totalTrials}`);
    logger.Write('=================================');
} 