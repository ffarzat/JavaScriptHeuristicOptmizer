var Shell = require('shelljs');

var os = require("os");

var async = require('async');

var messagesToProcess = [];

for (var i = 0; i < 4; i++) {

    var instance = function (callback) {
        var os = require("os");
        var returnedOutput = Shell.exec('cd Libraries/uuid && npm test', {silent:true});
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

