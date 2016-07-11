var async = require('async');

var messagesToProcess = [];

for (var i = 0; i < 95; i++) {

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