/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import WebSocketServer = require('websocket');

/**
 * Client to run commands
 */
export default class Client{
    connection: WebSocketServer.connection;
    id: number
    available: boolean;
    ws: any;
    
    serverUrl: string;
    
    /**
     * Configures the client
     */
    Setup(configuration: IConfiguration){
        this.serverUrl = configuration.url + ':' + configuration.port;
        var ws = new WebSocket(this.serverUrl, 'echo-protocol');
    }
}