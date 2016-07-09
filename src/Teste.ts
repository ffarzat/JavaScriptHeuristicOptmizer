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



/**
 * Just for test messages
 */
var astExplorer: ASTExplorer = new ASTExplorer();
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var lib = configuration.libraries[0];
var libFile: string = lib.mainFilePath;
var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}


console.log(`LIB: ${lib.name}`);


//var indexes: number[] = astExplorer.IndexNodes(generatedIndividual);

var messageId = uuid.v4();

var msg: Message = new Message();
var context = new OperatorContext();
context.Operation = "Test";
context.First = generatedIndividual;
context.Original = generatedIndividual; //is usual to be the original
context.LibrarieOverTest = lib;

msg.id = messageId;
msg.ActualLibrary = lib.name;
msg.ctx = context;


//========================================================================================== Clients Pool
var Pool = new pool(__dirname + '/Child.js', null, null, { size: configuration.clientsTotal, log: false, timeout: configuration.clientTimeout * 1000 });

var messagesToProcess = [];

for (var i = 0; i < 50; i++) {

    var instance = function (callback) {
        msg.id = i.toString();
        Pool.enqueue(JSON.stringify(msg), callback);
    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, // optional callback
    function (err, results) {
        // the results array will equal ['one','two'] even though
        // the second function had a shorter timeout.
        if (err)
            console.log(`err: ${err.stack}`);

        console.log(`results: ${results.length}`);
        process.exit();

    }
);


