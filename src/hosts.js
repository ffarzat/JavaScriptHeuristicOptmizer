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

//var clientsTotal = 9;
var libname = "moment";
var timeoutMS = 3000;

//Async


var messagesToProcess = [];
var actualHost = cpusString[48];

try {
    var msgId = uuid.v4();
    var stdout = child_process.execSync(`mpirun -np 5 -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${msgId} ${libname} ${timeoutMS}`, { maxBuffer: 1024 * 5000 }).toString();

    console.log(stdout);

} catch (error) {
    console.log(error.stack);
}


/*


for (var i = 0; i < clientsTotal; i++) {

    var instance = function (callback) {
        var msgId = uuid.v4();
        var workerProcess = child_process.execSync(`mpirun -np 5 -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${msgId}`, { maxBuffer: 1024 * 5000 },
            function (error, stdout, stderr) {
                var msgResult: Message = { id: msgId, sucess: false, min: 0, max: 0, mean: 0, median: 0, duration: 0 };


                if (error) {
                    stdout = errorString;
                    error = null;
                }

                if (stderr) {
                    stdout = errorString;
                    error = null;
                }

                if (stdout.length == 0 || stdout.indexOf("mpirun") > -1) {
                    stdout = errorString;
                }

                console.log(stdout);
                callback(error, stdout);
            });

        workerProcess.on('exit', function (code) {
            //if(code !== 0)
            //console.log(`{id: ${msgId}, sucess: false, host: no-one, duration:997`);
        });

    };

    messagesToProcess.push(instance);
}

async.parallel(messagesToProcess, function (err, results) {

    if (err)
        console.log(`async.parallel err: ${err.stack}`);

    console.log(`results: ${results.length}`);
});

*/