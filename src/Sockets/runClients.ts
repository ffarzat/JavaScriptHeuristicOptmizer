import Client from './Client';
import Server from './Server';

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
    var context: OperatorContext = JSON.parse(e.data);
    console.log(`chegou o pedido ${configuration.mutationTrials}`);
    
    ws.send(`Take your mutant man!`);
});