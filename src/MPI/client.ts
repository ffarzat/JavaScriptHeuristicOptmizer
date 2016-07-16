var os = require("os");
const child_process = require('child_process');
var libPath = process.argv[2];
var timeoutMS = process.argv[3];
var npmTmpDir = process.argv[4];
var bufferOption = { maxBuffer: 5000 * 1024 };

//console.log(`libPath: ${libPath}`);
//console.log(`timeoutMS: ${timeoutMS}`);
var start = process.hrtime();

var timeoutId = setTimeout(function () {
    process.exit(1);
}, timeoutMS);

var workerProcess = child_process.exec(`cd ${libPath} && npm test`, bufferOption, function (error, stdout, stderr) {
    clearTimeout(timeoutId);

    if (error) {
        //console.log(error.stack);
        //console.log('MPN Error code: ' + error.code);
        //console.log('MPNSignal received: ' + error.signal);
        console.log(`{"sucess":"false", "host":"${os.hostname()}", "duration":"${clock(start)}"}`);
        process.exit(error.code);
    }
    //console.log('MPN stdout: ' + stdout);
    //console.log('MPNstderr: ' + stderr);
    console.log(`{"sucess":"true", "host":"${os.hostname()}", "duration":"${clock(start)}"}`);
    process.exit();
});

/**
 * Milisecs F
 */
function clock(startTime:any):number {
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}
