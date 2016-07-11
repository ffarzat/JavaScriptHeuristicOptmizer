var os = require("os");
const child_process = require('child_process');

var workerProcess = child_process.exec(`cd Libraries/moment && npm test`, { maxBuffer: 1024 * 5000 }, function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        //console.log('MPN Error code: ' + error.code);
        //console.log('MPNSignal received: ' + error.signal);
    }
    //console.log('MPN stdout: ' + stdout);
    //console.log('MPNstderr: ' + stderr);
});

workerProcess.on('exit', function (code) {
    //console.log(`       Child Host: ${os.hostname()}`);
    //console.log('       MPN exit code ' + code);
    //console.log(`       Tests ${process.argv[2]} executed inside host: ${os.hostname()}`);
    console.log(`{id: ${process.argv[2]}, code: ${code}, host: ${os.hostname()} }`);
});


