var os = require("os");
const child_process = require('child_process');
var id = process.argv[2];
var libPath = process.argv[3];
var timeoutMS = process.argv[4];
var bufferOption = { maxBuffer: 500 * 1024 };



//console.log(`Id: ${id}`);
//console.log(`libPath: ${libPath}`);
//console.log(`timeoutMS: ${timeoutMS}`);

var start = process.hrtime();

var timeoutId = setTimeout(function () {
    process.exit(1);
}, timeoutMS);


var workerProcess = child_process.exec(`cd ${libPath} && npm test`, bufferOption, function (error, stdout, stderr) {
    clearTimeout(timeoutId);

    if (error) {
        console.log(error.stack);
        console.log('MPN Error code: ' + error.code);
        console.log('MPNSignal received: ' + error.signal);
        console.log(`{"id":"${id}", "sucess":"false", "host":"${os.hostname()}", "duration":"${clock(start)}", "error": "${error}"}`);
        var fs = require('fs');
        fs.writeFileSync("/home/users/ffarzat1981/log-client.txt", error);

        process.exit(error.code);
        
    }
    //console.log('MPN stdout: ' + stdout);
    //console.log('MPNstderr: ' + stderr);
    console.log(`{"id":"${id}", "sucess":"true", "host":"${os.hostname()}", "duration":"${clock(start)}"}`);
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
    if (!startTime) return process.hrtime();
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}
