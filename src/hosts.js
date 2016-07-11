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
console.log(`No host: ${cpusString[48]}`);
console.log(`No host: ${cpusString[95]}`);

//Sync


for (var index = 0; index < 5; index++) {

    var uuid = require('node-uuid');
    var istring = uuid.v4();

    //var returnedOutput = Shell.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, { silent: false });

    var returnedOutput = Shell.exec(`mpirun -np 5 -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, { silent: false });
}



//Async

/*
var messagesToProcess = [];

for (var i = 0; i < 46; i++) {

    var uuid = require('node-uuid');
    var istring = uuid.v4();

    var instance = function (callback) {

        var returnedOutput = Shell.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${istring}`, {silent:false});
    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {
        
        if (err)
            console.log(`err: ${err.stack}`);

        //console.log(`results: ${results.length}`);
    }
);


*/

//Parallel.Limit

/*

var messagesToProcess = [];

for (var i = 0; i < 46; i++) {

    var uuid = require('node-uuid');
    var istring = uuid.v4();

    var instance = function (callback) {
        

        var workerProcess = child_process.exec(`mpirun -np 5 --hostfile ${hostfile} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc  --max-old-space-size=102400 src/client.js ${istring}`, { maxBuffer: 1024 * 5000 },

            function (error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    //console.log('Error code: ' + error.code);
                    //console.log('Signal received: ' + error.signal);
                }
                console.log('stdout: ' + stdout);
                //console.log('id:12345678' );
                //console.log('stderr: ' + stderr);
                
                callback(error, stdout);
            });

        workerProcess.on('exit', function (code) {
            //console.log('Child process exited with exit code ' + code);
        });
    };

    messagesToProcess.push(instance);
}

parallelLimit(messagesToProcess, 5000, function (err, results) {

    if (err != undefined)
        console.log(`err: ${err.stack}`);

    console.log(`results: ${results.length}`);
});

*/