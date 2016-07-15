/// <reference path="./typings/tsd.d.ts" />

import ASTExplorer from './ASTExplorer';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import LogFactory from './LogFactory';
//import Queue from './MPI/Queue';
import TestResults from './TestResults';


import child_process = require('child_process');
import path = require('path');
import fs = require('fs');
var async = require("async");

// create a new queue
//var Mensagens = new Queue();

var messagesToProcess = [];

//Reads the config
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);

var Ncpus = process.argv[3];
var hostfile = process.argv[4];
var clientOptions = '--max-old-space-size=512000';
var bufferOption = { maxBuffer: 5000 * 1024 };
var allHosts: Array<string> = [];
var allHostsList = fs.readFileSync(hostfile).toString().split("\n");


allHostsList.forEach(element => {
    if (allHosts.indexOf(element) == -1 && element != "") {
        allHosts.push(element);
    }
});

allHosts.splice(0, 1); //removing actual host

console.log(`Hosts available:`);
allHosts.forEach(element => {
    console.log(`-> ${element}`);
});

//First Individual testing
var astExplorer: ASTExplorer = new ASTExplorer();
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var lib = configuration.libraries[0];
var libFile: string = lib.mainFilePath;
var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
var totalSlots = configuration.clientsTotal;
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

//console.log(`CPUS Available: ${numCPUs}`);
console.log(`LIB: ${lib.name}`);


var context = new OperatorContext();
context.Operation = "StartClients";
context.First = generatedIndividual;
context.Original = generatedIndividual; //is usual to be the original
context.LibrarieOverTest = lib;

var testUntil = configuration.testUntil;
var timeoutMS = configuration.clientTimeout * 1000;
var libPath = "Libraries/uuid";




var passedAllTests = true;
var max;
var min;
var avg;
var median;


for (var index = 0; index < configuration.trialsConfiguration[0].especific.neighborsToProcess; index++) {

    var instance = function (callback) {
        var mutante = astExplorer.Mutate(context);

        var contextMutante = new OperatorContext();
        contextMutante.Operation = "StartClients";
        contextMutante.First = mutante;
        contextMutante.Original = generatedIndividual; //is usual to be the original
        contextMutante.LibrarieOverTest = lib;

        var slotFree = GetFreeSlot();

        var directoryToTest = configuration.tmpDirectory + `/${slotFree}/` + contextMutante.LibrarieOverTest.name
        //logger.Write(`Testing... ${directoryToTest}`);

        Testar(contextMutante.LibrarieOverTest.mainFilePath, contextMutante.First, directoryToTest, timeoutMS, allHosts, callback);
        ReturnSlots(1);
    }

    messagesToProcess.push(instance);
}

console.log(`messagesToProcess: ${messagesToProcess.length}`);
var start = process.hrtime();

async.parallelLimit(messagesToProcess, configuration.clientsTotal, (error, results) => {
    console.log(error);
    console.log(results.length);

    console.log(`Total Duration: ${clock(start)}`);
});
//==================================================================================================================//>

function ReturnSlots(quant: number) {
    totalSlots += quant;
}

function GetFreeSlot(): number {
    var actual = totalSlots;
    totalSlots--;
    return actual;
}

/**
 * Milisecs F
 */
function clock(startTime: any): number {
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}

function Testar(libMainFilePath: string, mutant: Individual, npmCmdDir: string, timeout: number, allHosts: any, cb: () => void) {
    var hosts: string = "";
    var testCMD = "";


    var passedAllTests = true;

    var max;
    var min;
    var avg;
    var median;


    if (allHosts) {
        allHosts.forEach(host => {
            hosts += `${host},`;
        });

        hosts = hosts.substring(0, hosts.length - 1);

        testCMD = `mpirun -n ${testUntil} -host ${hosts} -x PBS_GET_IBWINS=1 -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 build/src/MPI/client.js ${npmCmdDir} ${timeout}`;
    }
    else {
        testCMD = `node --expose-gc --max-old-space-size=2047 src/client.js ${npmCmdDir} ${timeout}`;
        bufferOption = { maxBuffer: 200 * 1024 };
    }

    WriteCodeToFile(mutant, libMainFilePath);

    var workerProcess = child_process.exec(testCMD, bufferOption, (error, stdout, stderr) => {

        if (error || stderr) {
            logger.Write(`${error.stack}`);
            logger.Write(`${stderr}`);

            max = 0;
            min = 0;
            avg = 0;
            median = 0;
            passedAllTests = false;
        }

        var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
        stringList = stringList.substring(0, stringList.length - 1);

        var list = JSON.parse(`[${stringList}]`);
        var numbers = [];
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            numbers.push(element.duration);
            //this.logger.Write(`${stdout}`)
            console.log(`{${element.host}:${element.duration}:${element.sucess}}`);
        }

        max = Math.max.apply(null, numbers);
        min = Math.min.apply(null, numbers);
        avg = CalculateMean(numbers);
        median = CalculateMedian(numbers);
        passedAllTests = (list[0].sucess === "true");

        cb();
    });
}

/**
 * Writes the new code Over old Main File of the lib over tests
 */
function WriteCodeToFile(individual: Individual, libMainFilePath: string) {
    //this.logger.Write(`Saving over file ${this.libMainFilePath}`);
    fs.writeFileSync(libMainFilePath, individual.ToCode());
}


/**
 * From ms to sec
 */
function ToSecs(number) {
    return (number / 1000) % 60;
}


/**
 * simple median
 */
function CalculateMedian(values): number {

    values.sort(function (a, b) { return a - b; });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
}

/**
 * simple mean
 */
function CalculateMean(numbers): number {
    var total = 0
    for (var i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return parseFloat((total / numbers.length).toFixed(3));
}