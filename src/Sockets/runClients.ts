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

var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + uuid.v4();;
console.log(serverUrl);

var ws = new WebSocket(serverUrl, 'echo-protocol');

ws.addEventListener("message", (e) => {
    var msg: Message = JSON.parse(e.data);


    var localClient = new Client();
    console.log(`msg: ${msg.id}`);

    if (msg.ctx.Operation == "Mutation") {
        console.log('Doing a mutation...')
        var newCtx = localClient.Mutate(msg.ctx);
        msg.ctx = newCtx;
        console.log('Done!')
    }

    if (msg.ctx.Operation == "CrossOver") {
        console.log('Doing a CrossOver...')
        var newCtx = localClient.CrossOver(msg.ctx);
        msg.ctx = newCtx;
    }

    var msgProcessada = JSON.stringify(msg);
    ws.send(msgProcessada);
});

