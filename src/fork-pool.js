/**
 * A generic child process "fork" pool for node.
 *
 * @package fork-pool
 * @author Andrew Sliwinski <andrewsliwinski@acm.org>
 */

/**
 * Dependencies
 */
var _ = require('lodash');
var childProcess = require('child_process');
var generic = require('generic-pool');

/**
 * Constructor
 */
function Pool(path, args, options, settings) {
    _.defaults(settings, {
        name: 'fork-pool',
        size: require('os').cpus().length,
        log: false,
        timeout: 30000,
        debug: false,
        debugPort: process.debugPort	// Default debugging port for the main process. Skip from here.
    });

    //

    this.pool = generic.Pool({
        settings: settings,
        name: settings.name,
        create: function (callback) {
            var debugArgIdx = process.execArgv.indexOf('--debug');
            if (debugArgIdx !== -1) {
                // Remove debugging from process before forking
                process.execArgv.splice(debugArgIdx, 1);
            }
            if (this.settings.debug) {
                // Optionally set an unused port number if you want to debug the children.
                // This only works if idle processes stay alive (long timeout), or you will run out of ports eventually.
                process.execArgv.push('--debug=' + (++this.settings.debugPort));
            }
            var newArgs = args.slice(0);
            newArgs.push(this.actual);
            var childNode = childProcess.fork(path,newArgs, options);
            //console.log(`Seria o cliente ${this.actual}`);
            this.actual++;
            callback(null, childNode);
        },
        destroy: function (client) {
            client.kill();
        },
        max: settings.size,
        min: 1,
        idleTimeoutMillis: settings.timeout,
        log: settings.log,
        actual: 0
    });
};

Pool.prototype.enqueue = function (data, callback) {
    var instance = this.pool;
    instance.acquire(function (err, client) {
        if (err) {
            runGC();
            callback(err);
        } else {
            client.send(data);
            client.once('message', function (message) {
                var a = {
                    pid: client.pid,
                    stdout: message
                };

                instance.release(client);
                runGC();
                callback(null, a);
            });
        }
    });
};

Pool.prototype.drain = function (callback) {
    var instance = this.pool;
    instance.drain(function () {
        instance.destroyAllNow();
        callback(null);
    });
};

function runGC() {
    if (typeof global.gc != "undefined") {
        console.log(`Mem Usage Pre-GC ${formatBytes(process.memoryUsage().heapTotal, 2)}`);
        global.gc();
        console.log(`Mem Usage ${formatBytes(process.memoryUsage().heapTotal, 2)}`);
    }
}

/**
 * Format for especific size
 */
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = Pool;
