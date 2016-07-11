var fs = require("fs");
var os = require("os");
var Shell = require('shelljs');
var async = require('async');
var parallelLimit = require('run-parallel-limit')
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

    var uuid = require('node-uuid');

    var instance = function (callback) {

        var workerProcess = child_process.exec(`mpirun -np 5 -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${uuid.v4()}`, { maxBuffer: 1024 * 5000, timeout: 1000},
            function (error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    //console.log('Error code: ' + error.code);
                    //console.log('Signal received: ' + error.signal);
                }
                //console.log('stdout: ' + stdout);
                //console.log('id:12345678' );
                //console.log('stderr: ' + stderr);
                console.log(stdout);

                //Erro de qualquer espécie! Pega o original e devolve


                callback(error, stdout);
            });

        workerProcess.on('exit', function (code) {
            //console.log('Child process exited with exit code ' + code);
        });

    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {

    if (err)
        console.log(`err: ${err.stack}`);

    console.log(`results: ${results.length}`);
});