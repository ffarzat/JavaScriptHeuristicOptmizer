/// <reference path="../typings/tsd.d.ts" />

import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import WebSocketServer = require('ws');

/**
 * Client representaion on Server
 */
export default class Client{
    connection: WebSocketServer;
    id: string
    available: boolean;
    
}