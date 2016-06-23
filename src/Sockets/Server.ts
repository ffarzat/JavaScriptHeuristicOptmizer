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

    clients: Client[] = []; //store available clients
    messages: Message[] = []; //store all received messages 
    clientProcessing: Client[] = []; //store client processing something
    waitingMessages: Message[] = []; //store waiting messages

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
                "Messages": this.messages.length,
                "WaitingMessages": this.waitingMessages.length,
                "Clients": this.clients.length,
                "ClientProcessing": this.clientProcessing.length
            }];
            res.send(list);
        });

        app.get('/Status/:id', (req, res) => {
            var list = [{
                "id": 1,
                "Time": new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                "Messages": this.messages.length,
                "WaitingMessages": this.waitingMessages.length,
                "Clients": this.clients.length,
                "ClientProcessing": this.clientProcessing.length
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
            this.clients.push(client);

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
            this.logger.Write(`Client[${client.id}]Disconnected. Bye!`);
            var index = -1;
            this.clients.forEach(element => {
                if (element.id === client.id) {
                    return;
                }
                index++;
            });

            //this.logger.Write(`Index: ${index}`);
            this.clients.splice(index, 1);  //remove from availables
            this.ValidateRemove(client);
            //this.logger.Write(`Left ${this.clients.length} client(s)`);


            var waitingIndex = -1;
            this.clientProcessing.forEach(element => {
                if (element.id === client.id) {
                    return;
                }
                waitingIndex++;
            });
            this.clientProcessing.splice(waitingIndex, 1);  //remove from availables

        });

        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            try {
                var msg: Message = JSON.parse(message);
                //this.logger.Write(`client[${client.id}]Done inside server`);
                this.Done(client, msg);
                //this.logger.Write(`Left ${this.clients.length} client(s)`);
            }
            catch (err) {
                this.logger.Write(`[Server] ${err}`);
            }
        });
    }

    /**
     * Mode messages from waitingMessages to messages
    */
    ValidateRemove(client: Client) {
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var element = this.waitingMessages[index];
            if (element.clientId == client.id) {
                this.waitingMessages.splice(index, 1); //remove

                element.clientId = undefined;
                this.messages.push(element);

                this.logger.Write(`Client[${client.id}]Error: saving back msg: ${element.id}`);
            }
        }
    }

    /**
     * Print the server status
     */
    Status(): void {
        console.log(`=============`);
        console.log(`${this.messages.length} message(s) waiting free client(s)`);
        console.log(`${this.waitingMessages.length} message(s) in process`);
        console.log(`${this.clients.length} client(s) waiting task(s)`);
        console.log(`${this.clientProcessing.length} client(s) working now`);
        console.log(`=============`);

        this.runGC();
    }


    /**
     * Send a request for any available client to o a mutation over OperatorContext
    */
    DoAnOperation(msg: Message, cb: (ctx: Message) => void) {
        var item = new Message();
        item.id = msg.id;
        item.ctx = msg.ctx;
        item.cb = cb;
        this.messages.push(item);
        //this.logger.Write(`Saving msg...`);
    }

    /**
     * Process messages
     */
    ProcessQueue() {

        if (this.clients.length == 0)
            return;

        if (this.messages.length == 0)
            return;

        //this.logger.Write(`Left ${this.messages.length} operations to process.`);

        for (var clientIndex = 0; clientIndex < this.clients.length; clientIndex++) {
            if (this.messages.length > 0) {

                var availableClient = this.clients.pop();
                this.clientProcessing.push(availableClient);

                var msg = this.messages.pop();
                if (!msg.clientId) {

                    msg.clientId = availableClient.id;
                    //this.logger.Write(`[Server] Sending to client[${availableClient.id}]`);

                    //this.logger.Write(`[Server] Sending msg ${msg.id}`);
                    //var stringMSG = JSON.stringify(msg);
                    //console.log(`[Server] MSG Bytes ${this.getBytes(stringMSG)}`);
                    availableClient.connection.send(JSON.stringify(msg));

                    this.timeouts[msg.id] = setTimeout(() => {
                        this.logger.Write(`[Server] ERROR! Timeout waiting message  ${msg.id}`);
                        clearTimeout(this.timeouts[msg.id]);
                        delete this.timeouts[msg.id];
                        this.ValidateRemove(availableClient);


                    }, this.configuration.clientTimeout * 1000);

                    this.waitingMessages.push(msg);
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

        //this.logger.Write(`[DONE] message :[${message.id}]`);

        for (var clientIndex = 0; clientIndex < this.clientProcessing.length; clientIndex++) {
            var clientelement = this.clientProcessing[clientIndex];

            if (client.id === clientelement.id) {
                //this.logger.Write(`client index:[${clientIndex}] (inside for)`);
                break;
            }

        }

        this.clientProcessing.splice(clientIndex, 1); //cut off
        this.clients.push(client); //be available again

        //Finds message index
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var msgelement = this.waitingMessages[index];
            if (msgelement.id == message.id) {
                //this.logger.Write(`message index:[${index}] (inside for)`);
                break;
            }
        }

        var localmsg = this.waitingMessages[index];

        this.waitingMessages.splice(index, 1); //cut off
        clearTimeout(this.timeouts[localmsg.id]);
        delete this.timeouts[localmsg.id];
        localmsg.cb(message); //do the callback!

    }

    runGC() {
        if (typeof global.gc != "undefined") {
            this.logger.Write(`Mem Usage Pre-GC ${this.formatBytes(process.memoryUsage().heapTotal, 2)}`);
            global.gc();
            this.logger.Write(`Mem Usage Post-GC ${this.formatBytes(process.memoryUsage().heapTotal, 2)}`);
        }
    }
}

