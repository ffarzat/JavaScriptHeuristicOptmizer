

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
var fse = require('fs-extra');
import path = require('path');
import Shell = require('shelljs');
var optmizer: Optmizer = undefined;

//=========================================================================================== Reads config
//console.log(process.argv);

var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);

var Ncpus = process.argv[3];
var hostfile = process.argv[4];
var retrial = process.argv[5];
var clientOptions = '--max-old-space-size=512000';
var allHosts: Array<string> = [];


var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

//Patch for parallel from PSB command line
if (retrial != undefined) {
    var intStartTrial = parseInt(retrial);
    configuration.trials = intStartTrial + 1;
    configuration.startTrial = intStartTrial;
    configuration.logFilePath = configuration.logFilePath.replace("build/", `build/${retrial}-`);
    configuration.trialResultsFile = `${retrial}-` + configuration.trialResultsFile;
}

//=========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

if (hostfile == undefined || hostfile == null || hostfile == "undefined" || hostfile == "null") {
    clientOptions = '--max-old-space-size=' + (configuration.memory == undefined ? 2047 : configuration.memory);
} else {
    var allHostsList = fs.readFileSync(hostfile).toString().split("\n");

    allHostsList.forEach(element => {

        if (allHosts.indexOf(element) == -1 && element != "") {
            allHosts.push(element);
        }
    });

    allHosts.splice(0, 1); //removing actual host

    logger.Write(`Hosts available:`);
    allHosts.forEach(element => {
        logger.Write(`-> ${element}`);
    });

    clientOptions = '--max-old-space-size=512000';
}

logger.Write(`clientOptions: ${clientOptions}`);

var caminhodopool = __dirname.replace('build', '');
var pool = require(caminhodopool + '/fork-pool.js');
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


    //Para cada lib instalada
    for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
        var element = configuration.libraries[libIndex];
        var libDirectoryPath = path.join(process.cwd(), element.path);
        var libNodeModules = path.join(libDirectoryPath, "node_modules");

        //Verifca se já existem os clients necessários no scratch
        for (var clientIndex = 0; clientIndex < configuration.clientsTotal; clientIndex++) {
            var tempClientpath = path.join(configuration.tmpDirectory, clientIndex.toString());
            var tempLibPath = path.join(tempClientpath, element.name);

            if (!fs.existsSync(tempLibPath)) {
                logger.Write(`[index] Criando o client ${clientIndex} em ${tempLibPath}`);
                
                if (!fs.existsSync(tempClientpath)) {
                    fs.mkdirSync(tempClientpath);
                }

                fs.mkdirSync(tempLibPath);
                fse.copySync(libDirectoryPath, tempLibPath, { "clobber": true, "filter": function () { return true; } });
            }
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
    logger.Write(`Results File:  ${configuration.trialResultsFile}`);
    logger.Write(`Total Trials:  ${configuration.trials}`);
    logger.Write(`Start Trial:  ${configuration.startTrial}`);
    logger.Write(`Especific configuration:  ${configuration.trialsConfiguration.length}`);
    logger.Write(`Total libraries:  ${configuration.libraries.length}`);
    logger.Write(`Total heuristics:  ${configuration.heuristics.length}`);
    logger.Write(`Total runs [${configuration.trials} * ${configuration.trialsConfiguration.length} * ${configuration.libraries.length} * ${configuration.heuristics.length} ]:  ${totalTrials}`);
    logger.Write('=================================');
} 