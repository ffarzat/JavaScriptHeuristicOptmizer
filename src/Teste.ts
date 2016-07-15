/// <reference path="./typings/tsd.d.ts" />
//	node build/src/teste.js
/*
import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from './IConfiguration';
import ASTExplorer from './ASTExplorer';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import Message from './Sockets/Message';
import LogFactory from './LogFactory';

var uuid = require('node-uuid');
var pool = require('fork-pool');
var async = require('async');

var numCPUs = (require('os').cpus().length);


/**
 * Just for test messages
 
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);

var Ncpus = process.argv[3];
var hostfile = process.argv[4];
var clientOptions = '--max-old-space-size=512000';
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


var astExplorer: ASTExplorer = new ASTExplorer();
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var lib = configuration.libraries[0];
var libFile: string = lib.mainFilePath;
var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);


//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}


//console.log(`CPUS Available: ${numCPUs}`);
console.log(`LIB: ${lib.name}`);

//var indexes: number[] = astExplorer.IndexNodes(generatedIndividual);

var FirstMsg: Message = new Message();
var context = new OperatorContext();
context.Operation = "StartClients";
context.First = generatedIndividual;
context.Original = generatedIndividual; //is usual to be the original
context.LibrarieOverTest = lib;

FirstMsg.ActualLibrary = lib.name;
FirstMsg.ctx = context;

//========================================================================================== Clients Pool
var uniquePool = new pool(__dirname + '/Child.js', [configFile], { execArgv: [clientOptions] }, { size: configuration.clientsTotal + 1, log: false, timeout: configuration.copyFileTimeout * 1000 });

/*
uniquePool.enqueue(JSON.stringify(FirstMsg), (err, obj) => {
    doBegin();
});


var messageList: Array<Message> = [];


//function doBegin() {
var messagesToProcess = [];

for (var i = 0; i < configuration.trialsConfiguration[0].especific.neighborsToProcess; i++) {

    var msg: Message = new Message();
    var context = new OperatorContext();
    context.Operation = "Test";
    context.First = generatedIndividual;
    context.Original = generatedIndividual;
    context.LibrarieOverTest = lib;

    msg.Hosts = allHosts;
    msg.ActualLibrary = lib.name;
    msg.ctx = context;
    msg.id = i;

    messageList.push(msg);

    /*
    var instance = function (callback) {
        uniquePool.enqueue(JSON.stringify(messageList.pop()), callback);
    };

    messagesToProcess.push(instance);
    
}

logger.Write(`Total clients ${configuration.clientsTotal}`);
logger.Write(`Total messages ${messageList.length}`);

var totalProcessedMsgs = 0;
var exectimer = require('exectimer');
var Tick = new exectimer.Tick(5000);
Tick.start();

messageList.forEach(element => {
    logger.Write(`Sending message ${element.id}`);

    uniquePool.enqueue(JSON.stringify(element), (err, obj) => {
        totalProcessedMsgs++;
        
        if (err)
            logger.Write(`err: ${err.stack}`);


        var processedMessage = obj.stdout;
        logger.Write(`msg ${processedMessage.id} done.`);

        if (totalProcessedMsgs == configuration.trialsConfiguration[0].especific.neighborsToProcess) {
            Tick.stop();
            var trialTimer = exectimer.timers[5000];
            logger.Write(`Total time: ${ToNanosecondsToSeconds(trialTimer.duration())}`);

            uniquePool.drain(function (err) {
                if (err)
                    logger.Write(`err: ${err.stack}`);

                process.exit();
            });

        }
    });
});

logger.Write(`All messages were sent.`);




/*
Tick.stop();
var trialTimer = exectimer.timers[1];
console.log(`Tempo: ${ToNanosecondsToSeconds(trialTimer.duration())}`);

async.parallel(messagesToProcess,
    function (err, results) {
        if (err)
            console.log(`err: ${err.stack}`);

        console.log(`results: ${results.length}`);

        Tick.stop();
        var trialTimer = exectimer.timers[1];
        console.log(`Tempo: ${ToNanosecondsToSeconds(trialTimer.duration())}`);

        process.exit();

    }
);
*/
//}

/**
 * Transform nano secs in secs
 
function ToNanosecondsToSeconds(nanovalue: number): number {
    return parseFloat((nanovalue / 1000000000.0).toFixed(3));
}

*/

import ASTExplorer from './ASTExplorer';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import LogFactory from './LogFactory';
import Queue from './MPI/Queue';
const child_process = require('child_process');
import path = require('path');
import fs = require('fs');

// create a new queue
var fila = new Queue();

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

var testUntil = 5;
var timeoutMS = configuration.clientTimeout * 1000;
var libPath = "Libraries/uuid";

var hosts: string = "";
allHosts.forEach(host => {
    hosts += `${host},`;
});

hosts = hosts.substring(0, hosts.length - 1);

var testCMD = `mpirun -n ${testUntil} -host ${hosts} -x PBS_GET_IBWINS=1 -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 build/src/MPI/client.js ${libPath} ${timeoutMS}`;


var passedAllTests = true;
var max;
var min;
var avg;
var median;



var stdout = child_process.execSync(testCMD, bufferOption).toString();
//console.log(`[CommandTester] After`);
var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
stringList = stringList.substring(0, stringList.length - 1);
//console.log(`[${stringList}]`);

var list = JSON.parse(`[${stringList}]`);
var numbers = [];
for (var index = 0; index < list.length; index++) {
    var element = list[index];
    numbers.push(element.duration);
    //this.logger.Write(`${stdout}`)
    console.log(`[Executado no host: ${element.host}:${element.duration}/${element.sucess}]`);
}

max = Math.max.apply(null, numbers);
min = Math.min.apply(null, numbers);
avg = this.mean(numbers);
median = this.median(numbers);
passedAllTests = (list[0].sucess === "true");

console.log(`Min: ${ToSecs(min)}`);
console.log(`Max: ${ToSecs(max)}`);
console.log(`Mean: ${ToSecs(avg)}`);
console.log(`Median: ${ToSecs(median)}`);
console.log(`Duration: ${ToSecs(max)}`); // Now is Max
console.log(`passedAllTests: ${passedAllTests}`); // Now is Max


/**
 * From ms to sec
 */
function ToSecs(number) {
    return (number / 1000) % 60;
}