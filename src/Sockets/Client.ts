/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import WebSocketServer = require('websocket');

/**
 * Client representaion on Server
 */
export default class Client{
    connection: WebSocketServer.connection;
    id: number
    available: boolean;
    
}