import IConfiguration from '../IConfiguration';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Client from './Client';
import Message from './Message';

import WebSocketServer = require('ws');

/**
 * Server to control the optmization process
 */
export default class Server {

    wsServer: WebSocketServer.Server; //new require('websocket').server
    port: number;
    url: string;
    logger: ILogger;

    clients: Client[] = []; //store available clients
    messages: Message[] = []; //store all received messages 

    clientProcessing: Client[] = []; //store client processing something

    waitingMessages: Message[] = []; //store waiting messages

    /**
     * Configs the server to execute
     */
    Setup(configuration: IConfiguration): void {

        this.port = configuration.port;
        this.url = configuration.url;

        this.wsServer = new WebSocketServer.Server({ port: this.port });
        this.HandleServer();
        this.logger.Write(`[Server]Listening at ${this.url}:${this.port}`);
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

            var index = this.clients.indexOf(client);
            this.clients.splice(index, 1);  //remove from availables
            this.ValidateRemove(client);

            //this.logger.Write(`Left ${this.clients.length} client(s)`);
        });

        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            var msg: Message = JSON.parse(message);

            //this.logger.Write(`client[${client.id}]Done inside server`);

            this.Done(client, msg);
            //this.logger.Write(`Left ${this.clients.length} client(s)`);
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
                this.messages.push(element);
                this.logger.Write(`Client[${client.id}]Error: saving back msg: ${element.id} [client disconnected unexpectedly]`);
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
                msg.clientId = availableClient.id;
                //this.logger.Write(`[Server] Sending to client[${availableClient.id}]`);
                availableClient.connection.send(JSON.stringify(msg));
                this.waitingMessages.push(msg);

            }
            else {
                break;
            }
        }
    }
    
    /**
     * Suspend Client work with a timeout constraint
     */
    VerifyClientsTimeout(){
        
    }
    

    /**
     * Relases the callback magic
     */
    Done(client: Client, message: Message) {

        for (var clientIndex = 0; clientIndex < this.clientProcessing.length; clientIndex++) {
            var clientelement = this.clientProcessing[clientIndex];

            if (client.id === clientelement.id) {
                //this.logger.Write(`client index:[${clientIndex}] (inside for)`);
                break;
            }

        }
        //this.logger.Write(`client index:[${clientIndex}] (out of for)`);
        this.clientProcessing.splice(clientIndex, 1); //cut off
        this.clients.push(client); //be available again
        //this.logger.Write(`client[${client.id}] available`);

        //Finds message index
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var msgelement = this.waitingMessages[index];
            if (msgelement.id == message.id) {
                //this.logger.Write(`message index:[${index}] (inside for)`);
                break;
            }
        }
        //this.logger.Write(`         [Server]Checking Testresults`);
        //this.logger.Write(`         [Server]First ${message.ctx.First.testResults}`);
        //if(message.ctx.Second)
            //this.logger.Write(`         [Server]Second ${message.ctx.Second.testResults}`);
        //if(message.ctx.Original)
        //this.logger.Write(`         [Server]Original ${message.ctx.Original.testResults}`);

           

        //this.logger.Write(`message index:[${index}] (out of for)`);
        var localmsg = this.waitingMessages[index];
        this.waitingMessages.splice(index, 1); //cut off
        //this.logger.Write("[Server] Before Message Callback ");
        localmsg.cb(message); //do the callback!
        //this.logger.Write("[Server] After Message Callback ");
    }
}

