import Client from './Client';
import Server from './Server';
import Message from './Message';

import OperatorContext from '../OperatorContext';
import Individual from '../Individual';

import IConfiguration from '../IConfiguration';
import LogFactory from '../LogFactory';

import fs = require('fs');
import path = require('path');
import WebSocket = require('ws');
var uuid = require('node-uuid');


var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

var clientId = uuid.v4();

var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + clientId;
console.log(serverUrl);

var ws = new WebSocket(serverUrl, 'echo-protocol');

ws.addEventListener("message", (e) => {
    
    logger.Write(e.data);
    
    var msg: Message = JSON.parse(e.data);


    var localClient = new Client();
    localClient.id = clientId;
    localClient.logger = logger;
    localClient.Setup(configuration);

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

