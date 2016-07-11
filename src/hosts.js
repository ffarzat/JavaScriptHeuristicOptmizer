/*
var Shell = require('shelljs');

var os = require("os");

var async = require('async');

var messagesToProcess = [];

for (var i = 0; i < 4; i++) {

    var instance = function (callback) {
        var os = require("os");
        var returnedOutput = Shell.exec('cd Libraries/uuid && npm test', {silent:false});
        console.log(`Hostname: ${os.hostname()} - Tests done `);
    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {
        
        if (err)
            console.log(`err: ${err.stack}`);

        console.log(`results: ${results.length}`);
        process.exit();

    }
);
*/
var Shell = require('shelljs');
const fs = require('fs');
const child_process = require('child_process');

var Ncpus = process.argv[2];
var hostfile = process.argv[3];

console.log(`Ncpus: ${Ncpus}`);
console.log(`hostfile: ${hostfile}`);

for (var index = 0; index < 47; index++) {
    var returnedOutput = Shell.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, {silent:false});
}


/*
var async = require('async');

var messagesToProcess = [];

for (var i = 0; i < 47; i++) {

    var istring = JSON.stringify(i);
    var instance = function (callback) {
        
        var returnedOutput = Shell.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, {silent:false});

        
        var workerProcess = child_process.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, {maxBuffer: 1024 * 5000},

            function (error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: ' + error.code);
                    console.log('Signal received: ' + error.signal);
                }
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
            });

        workerProcess.on('exit', function (code) {
            console.log('Child process exited with exit code ' + code);
        });

        
    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {

    if (err)
        console.log(`err: ${err.stack}`);

    console.log(`results: ${results.length}`);
});


*/


