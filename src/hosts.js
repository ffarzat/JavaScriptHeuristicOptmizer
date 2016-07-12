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
var timeoutMS = 15000;
var testUntil = 5;

//Async


var messagesToProcess = [];
var actualHost = cpusString[48];

try {
    var msgId = uuid.v4();
    var stdout = child_process.execSync(`mpirun -np ${testUntil} -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${msgId} ${libname} ${timeoutMS}`, { maxBuffer: 1024 * 5000 }).toString();

    var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
    stringList = stringList.substring(0, stringList.length - 1);
    //console.log(`[${stringList}]`);
    
    var list = JSON.parse(`[${stringList}]`);
    var numbers = [];
    for (var index = 0; index < list.length; index++) {
        var element = list[index];
        numbers.push(element.duration);
    }
    
    var max = Math.max.apply(null, numbers);
    var min = Math.min.apply(null, numbers);
    var avg = mean(numbers);
    var median = median(numbers);

    console.log(`Min: ${ToSecs(min)}`);
    console.log(`Max: ${ToSecs(max)}`);
    console.log(`Mean: ${ToSecs(avg)}`);
    console.log(`Median: ${ToSecs(median)}`);
    console.log(`Duration: ${ToSecs(max)}`); // Now is Max


} catch (error) {
    console.log(error.stack);
}


function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i++ ) {
        total += numbers[i];
    }
    return total / numbers.length;
}

function ToSecs(number)
{
    return (number/1000) % 60;   
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