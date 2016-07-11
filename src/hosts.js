import Shell = require('shelljs');

var os = require("os");
console.log(`Hostname: ${os.hostname()}`);

var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec('cd Libraries/uuid && npm test', {silent:false}) as Shell.ExecOutputReturnValue);
console.log(`Tests done`);


/*
var async = require('async');

var messagesToProcess = [];

for (var i = 0; i < 96; i++) {

    var instance = function (callback) {
        var os = require("os");
        console.log(`Hostname: ${os.hostname()}`);
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