import Client from './Client';
import Server from './Server';

import IConfiguration from '../IConfiguration';
import LogFactory from '../LogFactory';

import fs = require('fs');
import path = require('path');
import WebSocket = require('ws');

var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

var serverUrl = configuration.url + ':' + configuration.port;
console.log(serverUrl);

var ws = new WebSocket(serverUrl, 'echo-protocol');

ws.addEventListener("message", (e) => {
    var msg = e.data;
    console.log(msg);
    
    ws.send("From Client!");
});