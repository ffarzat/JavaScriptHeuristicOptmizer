import IConfiguration from '../IConfiguration';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Client from './Client';
import Message from './Message';


import fs = require('fs');
import WebSocketServer = require('ws');
import express = require('express');

/**
 * Server to control the optmization process
 */
export default class Server {

    server: any;
    wsServer: WebSocketServer.Server; //new require('websocket').server
    port: number;
    url: string;
    logger: ILogger;

    clients = {}; //store available clients
    messages = {}; //store all received messages 
    clientProcessing = {}; //store client processing something
    waitingMessages = {}; //store waiting messages

    configuration: IConfiguration

    ActualHeuristic: string;
    ActualGlobalTrial: number
    ActualInternalTrial: number
    ActualLibrary: string;
    ActualLog: string[];

    timeouts = {};

    /**
     * Configs the server to execute
     */
    Setup(configuration: IConfiguration): void {

        this.configuration = configuration;

        this.port = configuration.port;
        this.url = configuration.url;

        var app = express();
        this.configure(app);
        this.server = app.listen(this.port);

        this.wsServer = new WebSocketServer.Server({ server: this.server });
        this.HandleServer();
        this.logger.Write(`[Server]Listening at ${this.url}:${this.port}`);
    }

    /**
     * Configure express app routes
     */
    private configure(app: express.Application) {
        app.use(express.static('build/client'));

        app.get('/Status', (req, res) => {
            var list = [{
                "id": 1,
                "Time": new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                "Messages": Object.keys(this.messages).length,
                "WaitingMessages": Object.keys(this.waitingMessages).length,
                "Clients": Object.keys(this.clients).length,
                "ClientProcessing": Object.keys(this.clientProcessing).length
            }];
            res.send(list);
        });

        app.get('/Status/:id', (req, res) => {
            var list = [{
                "id": 1,
                "Time": new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                "Messages": Object.keys(this.messages).length,
                "WaitingMessages": Object.keys(this.waitingMessages).length,
                "Clients": Object.keys(this.clients).length,
                "ClientProcessing": Object.keys(this.clientProcessing).length
            }];
            res.send(list);
        });

        app.get('/LogLine', (req, res) => {
            var list = [];
            var lineIndex = 0;

            list.push({
                "id": lineIndex,
                "Date": '2016-06-03 18:30:05',
                "Text": '[GA] says something'
            });

            res.send(list);


            /*
                        (this.configuration.logFilePath, (lines: string[]) => {
                            console.log(lines);
            
                            lines.forEach(element => {
                                var values = element.split("|");
            
                                list.push({
                                    "id": lineIndex,
                                    "Date": values[0],
                                    "Text": values[1]
                                });
                            });
            
            
            
                            res.send(list);
                        });
            
            */

        });

    }

    /**
     * Handle Server Events
     */
    private HandleServer() {

        //Handle on request
        this.wsServer.on('connection', (connection) => {
            var id = connection.upgradeReq.url.replace("/ID=", "");

            var client = new Client();
            client.id = id;
            client.connection = connection;
            client.available = true;
            this.clients[client.id] = client;

            this.logger.Write('Connection accepted [' + id + ']');
            //this.logger.Write(`${this.clients.length} client(s)`);
            this.HandleConnections(client);

            //client.connection.send('Do a mutation for me?'); //=============================================================== TEST!!!!

        });

    }

    /**
     * Handle Client Events
     */
    private HandleConnections(client: Client) {

        //Handle on close
        client.connection.on('close', (reasonCode, description) => {
            this.ValidateRemove(client);
        });

        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            try {
                var msg: Message = JSON.parse(message);

                this.logger.Write(`[Server] msg [${msg.id}]`);

                this.Done(client, msg);
                //this.logger.Write(`Left ${this.clients.length} client(s)`);
            }
            catch (err) {
                this.logger.Write(`[Server] ${err}`);
            }
        });
    }

    /**
     * Move messages from waitingMessages to messages
    */
    ValidateRemove(client: Client) {

        for (var key in this.waitingMessages) {
            var element = this.waitingMessages[key];

            if (element.clientId == client.id) {
                this.RemoveClient(client);

                delete this.waitingMessages[element.id];
                clearTimeout(this.timeouts[element.id]);
                delete this.timeouts[element.id];
                element.cb(element); //do the callback!
                break;
            }
        }
    }

    /**
     * Print the server status
     */
    Status(): void {
        console.log(`=============`);
        console.log(`${Object.keys(this.messages).length} message(s) waiting free client(s)`);
        console.log(`${Object.keys(this.waitingMessages).length} message(s) in process`);
        console.log(`${Object.keys(this.clients).length} client(s) waiting task(s)`);
        console.log(`${Object.keys(this.clientProcessing).length} client(s) working now`);
        console.log(`=============`);
    }


    /**
     * Send a request for any available client to o a mutation over OperatorContext
    */
    DoAnOperation(msg: Message, cb: (ctx: Message) => void) {
        var item = new Message();
        item.id = msg.id;
        item.ctx = msg.ctx;
        item.cb = cb;
        this.messages[item.id] = item;
        //this.logger.Write(`Saving msg...`);
    }

    /**
     * Process messages
     */
    ProcessQueue() {

        if (Object.keys(this.clients).length == 0)
            return;

        if (Object.keys(this.messages).length == 0)
            return;

        //this.logger.Write(`Left ${this.messages.length} operations to process.`);

        for (var clientIndex = 0; clientIndex < Object.keys(this.clients).length; clientIndex++) {
            if (Object.keys(this.messages).length > 0) {

                var availableClient = this.clients[Object.keys(this.clients)[0]];
                delete this.clients[availableClient.id];

                this.clientProcessing[availableClient.id] = availableClient;

                var msg = this.messages[Object.keys(this.messages)[0]]; //get
                delete this.messages[msg.id]; //delete

                if (!msg.clientId) {

                    msg.clientId = availableClient.id;

                    if (availableClient.connection.readyState == availableClient.connection.OPEN) {
                        //this.logger.Write(`[Server] Sending to client[${availableClient.id}]`);

                        //this.logger.Write(`[Server] Sending msg ${msg.id}`);
                        //var stringMSG = JSON.stringify(msg);
                        //console.log(`[Server] MSG Bytes ${this.getBytes(stringMSG)}`);
                        availableClient.connection.send(JSON.stringify(msg));

                        this.timeouts[msg.id] = setTimeout(() => {
                            this.logger.Write(`[Server] ERROR! Timeout waiting message  ${msg.id}`);

                            this.ExecuteMsgTimeout(msg); //ends the process
                            this.RemoveClient(availableClient);

                        }, this.configuration.clientTimeout * 1000);

                        this.waitingMessages[msg.id] = msg;
                    }
                    else {
                        this.logger.Write(`[Server] Client connection state error ${availableClient.id}`);
                        this.ValidateRemove(availableClient);
                    }
                }
                else {
                    this.logger.Write(`[Server] ERROR: ${msg.id} already have a client: ${msg.clientId}`);
                }
            }
            else {
                break;
            }
        }
    }

    /**
     * Calculates size of a string in bytes
     */
    getBytes(string): string {
        var bytes = Buffer.byteLength(string, 'utf8');
        return this.formatBytes(bytes, 2);
    }

    /**
     * Format for especific size
     */
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }


    /**
     * Relases the callback magic
     */
    Done(client: Client, message: Message) {

        var clientelement = this.clientProcessing[client.id];
        delete this.clientProcessing[client.id];

        this.clients[client.id] = client; //be available again

        var element = this.waitingMessages[message.id];

        delete this.waitingMessages[element.id];
        clearTimeout(this.timeouts[element.id]);
        delete this.timeouts[element.id];

        element.cb(message); //do the callback!

        this.logger.Write(`[Server] Msg ${message.id} CB done`);
        this.logger.Write(`${Object.keys(this.waitingMessages).length} message(s) left in waitingMessages`);

    }


    /**
     * Message execution timeout from Server (without Client agreement)
     */
    ExecuteMsgTimeout(message) {
        var element = this.waitingMessages[message.id];
        this.logger.Write(`message index:[${element.id}] (inside Timeout for)`);

        delete this.waitingMessages[element.id];
        clearTimeout(this.timeouts[element.id]);
        delete this.timeouts[element.id];

        element.cb(element); //do the callback!
    }



    /**
     * Delete a Client from trial
     */
    RemoveClient(client) {
        this.logger.Write(`[Server] Client[${client.id}] Disconnected. Removed.`);

        if (this.clients[client.id])
            this.clients[client.id].connection.close();

        if (this.clientProcessing[client.id])
            this.clientProcessing[client.id].connection.close()


        delete this.clients[client.id];
        delete this.clientProcessing[client.id];
    }

}

