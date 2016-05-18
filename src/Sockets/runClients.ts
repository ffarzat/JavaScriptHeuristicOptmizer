/**
 * Starts the client of Improvment Process based on configFile [Configuration.Json]
 */
import IConfiguration from '../IConfiguration';
import Optmizer from '../Optmizer';
import LogFactory from '../LogFactory';
import Server from './Server';
import Message from './Message';
import Client from './Client';
import OperatorContext from '../OperatorContext';
import Individual from '../Individual';

import WebSocket = require('ws');
import cluster = require('cluster');
import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');

var uuid = require('node-uuid');
//=========================================================================================== Cluster
var numCPUs = 2;
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    //=========================================================================================== Slave

    //=========================================================== Read Configuration values

    var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
    var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
    var testOldDirectory: string = process.cwd();
    process.setMaxListeners(0);
    //=========================================================== Logger
    var logger = new LogFactory().CreateByName(configuration.logWritter);
    logger.Initialize(configuration);

    //=========================================================== Libs initialization


    //=========================================================== Client initialization
    var clientId = uuid.v4();
    var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + clientId;
    logger.Write(serverUrl);

    var ws = new WebSocket(serverUrl, 'echo-protocol');

    ws.addEventListener("message", (e) => {

        var msg: Message = JSON.parse(e.data);

        var localClient = new Client();
        localClient.id = clientId;
        localClient.logger = logger;
        localClient.Setup(configuration);
        msg.ctx = localClient.Reload(msg.ctx);

        if (msg.ctx.Operation == "Mutation") {
            var newCtx = localClient.Mutate(msg.ctx);
            msg.ctx = newCtx;
        }

        if (msg.ctx.Operation == "MutationByIndex") {
            var newCtx = localClient.MutateBy(msg.ctx);
            msg.ctx = newCtx;
        }

        if (msg.ctx.Operation == "CrossOver") {
            var newCtx = localClient.CrossOver(msg.ctx);
            msg.ctx = newCtx;
        }

        if (msg.ctx.Operation == "Test") {
            var newCtx = localClient.Test(msg.ctx);
            msg.ctx = newCtx;
        }

        var msgProcessada = JSON.stringify(msg);
        ws.send(msgProcessada);
    });
}


