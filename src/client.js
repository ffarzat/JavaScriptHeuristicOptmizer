var os = require("os");
const child_process = require('child_process');
var start = process.hrtime();

var timeoutId = setTimeout(function() {
     process.exit(1);
}, 2000);


var workerProcess = child_process.exec(`cd Libraries/uuid && npm test`, { maxBuffer: 1024 * 5000 }, function (error, stdout, stderr) {
    clearTimeout(timeoutId);
    
    if (error) {
        //console.log(error.stack);
        //console.log('MPN Error code: ' + error.code);
        //console.log('MPNSignal received: ' + error.signal);
        console.log(`{id: ${process.argv[2]}, sucess: false, host: ${os.hostname()}, duration: ${clock(start)}}`);
        process.exit(error.code);
    }
    //console.log('MPN stdout: ' + stdout);
    //console.log('MPNstderr: ' + stderr);
    console.log(`{id: ${process.argv[2]}, sucess: true, host: ${os.hostname()}, duration: ${clock(start)}}`);
    process.exit();
});

workerProcess.on('exit', function (code) {
    //console.log(`       Child Host: ${os.hostname()}`);
    //console.log('       MPN exit code ' + code);
    //console.log(`       Tests ${process.argv[2]} executed inside host: ${os.hostname()}`);
    //console.log(`{id: ${process.argv[2]}, sucess: ${code === 0}, host: ${os.hostname()}, duration: ${clock(start)}}`);
});

/**
 * Milisecs F
 */
function clock(startTime) {
    if ( !startTime ) return process.hrtime();
    var end = process.hrtime(startTime);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}
