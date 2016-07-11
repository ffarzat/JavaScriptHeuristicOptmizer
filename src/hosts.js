var fs = require("fs");
var os = require("os");
var Shell = require('shelljs');
var async = require('async');
var parallelLimit = require('run-parallel-limit')
var uuid = require('node-uuid');
const child_process = require('child_process');


var Ncpus = process.argv[2];
var hostfile = process.argv[3];

console.log(`Ncpus: ${Ncpus}`);
console.log(`hostfile: ${hostfile}`);

var cpusString = fs.readFileSync(hostfile).toString().split("\n");
console.log(`Ncpus == ${cpusString.length}`);
console.log(`Test Host #1: ${cpusString[48]}`);

var clientsTotal = 9;

//Async


var messagesToProcess = [];
var actualHost = cpusString[48];


for (var i = 0; i < clientsTotal; i++) {



    var instance = function (callback) {
        var msgId = uuid.v4();
        var workerProcess = child_process.exec(`mpirun -np 5 -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${msgId}`, { maxBuffer: 1024 * 5000, timeout: 5000 },
            function (error, stdout, stderr) {
                if (error) {
                    //console.log(error.stack);
                    //console.log('Error code: ' + error.code);
                    //console.log('Signal received: ' + error.signal);
                    console.log(`{id: ${msgId}, sucess: false, host: no-one, duration:999`);
                }
                //console.log('stdout: ' + stdout);
                //console.log('id:12345678' );
                //console.log('stderr: ' + stderr);

                if (stdout.length == 0) {
                    stdout = `{id: ${msgId}, sucess: false, host: no-one, duration:999}`;
                }

                console.log(`{id: ${msgId}, sucess: false, host: no-one, duration:999}`);

                callback(error, stdout);
            });

        workerProcess.on('exit', function (code) {
            //if(code !== 0)
            //console.log(`{id: ${msgId}, sucess: false, host: no-one, duration:999`);
        });

    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {

    if (err)
        console.log(`err: ${err.stack}`);

    console.log(`results: ${results.length}`);
});