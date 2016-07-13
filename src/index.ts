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

//=========================================================================================== Reads config
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);

var Ncpus = process.argv[3];
var hostfile = process.argv[4];
var clientOptions = '--max-old-space-size=512000';


if (hostfile == undefined) {
    clientOptions = '--max-old-space-size=2047';
}

var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

//=========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

var allHosts = fs.readFileSync(hostfile).toString().split("\n");

var pool = require('fork-pool');
var uniquePool = new pool(__dirname + '/Child.js', [configFile], { execArgv: [clientOptions] }, { size: configuration.clientsTotal + 1, log: false, timeout: configuration.copyFileTimeout * 1000 });

//=========================================================================================== Server!

logger.Write(`Initializing Optmizer for ${configuration.libraries.length} libraries`);
logger.Write(`Preparing libs environment`);

ParseConfigAndLibs();
DisplayConfig();
ExecuteTrials(configuration.startTrial);

//=========================================================================================== Functions
function ExecuteTrials(globalTrial: number) {


    logger.Write(`============================= Optmizer Global trial: ${globalTrial}`);
    //var msg = new Message();
    //process.send(msg); //clean Server

    executeHeuristicTrial(globalTrial, configuration, 0, uniquePool, () => {
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

function executeHeuristicTrial(globalTrial: number, config: IConfiguration, heuristicTrial: number, ClientsPool: any, cb: () => void) {

    optmizer = new Optmizer();

    optmizer.Setup(configuration, globalTrial, heuristicTrial, ClientsPool, allHosts);
    optmizer.DoOptmization(0, () => {
        cb();
    });
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
    logger.Write(`Configuration: ${configurationFile}`);
    logger.Write(`Hosts cpus total: ${allHosts.length}`);
    logger.Write(`Ncpus: ${Ncpus}`);
    logger.Write(`hostfile: ${hostfile}`);
    logger.Write(`Clients total ${configuration.clientsTotal}`);
    logger.Write(`Tmp Dir [Config File] ${configuration.tmpDirectory}`);
    logger.Write(`Client timeout ${configuration.clientTimeout}`);
    logger.Write(`Client Files Timeout ${configuration.copyFileTimeout}`);
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