/// <reference path="./typings/tsd.d.ts" />

import cluster = require('cluster');

if (cluster.isMaster) {
    console.log('Master ' + process.pid + ' has started.');

    var worker = cluster.fork();

    // Receive messages from this worker and handle them in the master process.
    worker.on('message', function (msg) {
        console.log('Master ' + process.pid + ' received message from worker ' + worker.process.pid + '.', msg);
    });

    // Send a message from the master process to the worker.
    worker.send({ msgFromMaster: 'This is from master ' + process.pid + ' to worker ' + worker.process.pid + '.' });

    // Be notified when worker processes die.
    cluster.on('death', function (worker) {
        console.log('Worker ' + worker.process.pid + ' died.');
    });

} else {
    console.log('Worker ' + process.pid + ' has started.');

    getResponse('==>>').then(messageReceived => console.log(messageReceived));
    
}



async function getResponse(msg: string): Promise<string> {

    var promise = new Promise<string>(function (resolve, reject) {
        // Send message to master process.
        process.send({ msgFromWorker: 'This is from worker ' + process.pid + '.' })

        // Receive messages from the master process.
        process.on('message', function (msg) {
            console.log('Worker ' + process.pid + ' received message from master.', msg);
            resolve(msg + 'from promise');
        });
    });

    return promise;
}    