/// <reference path="./typings/tsd.d.ts" />
//	node build/src/teste.js

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from './IConfiguration';
import ASTExplorer from './ASTExplorer';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import Message from './Sockets/Message';

var uuid = require('node-uuid');
var pool = require('fork-pool');
var async = require('async');

var numCPUs = (require('os').cpus().length);


/**
 * Just for test messages
 */
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);

var Ncpus = process.argv[3];
var hostfile = process.argv[4];
var clientOptions = '--max-old-space-size=512000';
var allHosts: Array<string>;
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

uniquePool.enqueue(JSON.stringify(FirstMsg), (err, obj) => {
    doBegin();
});


var messageList = [];


function doBegin() {
    var messagesToProcess = [];

    for (var i = 0; i < configuration.clientsTotal; i++) {

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

        var instance = function (callback) {
            uniquePool.enqueue(JSON.stringify(messageList.pop()), callback);
        };

        messagesToProcess.push(instance);
    }


    var exectimer = require('exectimer');
    var Tick = new exectimer.Tick(1);
    Tick.start();

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
}

/**
 * Transform nano secs in secs
 */
function ToNanosecondsToSeconds(nanovalue: number): number {
    return parseFloat((nanovalue / 1000000000.0).toFixed(3));
}


