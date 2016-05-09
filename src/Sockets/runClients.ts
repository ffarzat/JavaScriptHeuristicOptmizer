import Client from './Client';
import Server from './Server';
import Message from './Message';

import OperatorContext from '../OperatorContext';

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
    
    console.log(`msg: ${msg.id}`);
    
    var msgProcessada = JSON.stringify(msg);
    ws.send(msgProcessada);
});