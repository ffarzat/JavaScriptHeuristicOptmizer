import IConfiguration from '../IConfiguration';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Client from './Client';
import Message from './Message';

import WebSocketServer = require('ws');
var uuid = require('node-uuid');


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

    waitingMessages: Message[] = []; //store waiting messages

    /**
     * Configs the server to execute
     */
    Setup(configuration: IConfiguration): void {

        this.port = configuration.port;
        this.url = configuration.url;

        this.wsServer = new WebSocketServer.Server({ port: this.port });
        this.HandleServer();
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
            this.logger.Write('Peer ' + client.id + ' disconnected.');

            var index = this.clients.indexOf(client);
            this.clients.splice(index, 1);  //remove from availables

            //TODO: tratar se precisa reprocessar alguma mensagem que estava com ele


            this.logger.Write(`Left ${this.clients.length} client(s)`);
        });

        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            this.logger.Write(`${message}`);

            if (this.clients.indexOf(client) == -1) {
                this.clients.push(client); //be available again
                //apagar a mensagem em waitingMessages e chamar o callback
            }

        });
    }

    /**
     * Send a request for any available client to o a mutation over OperatorContext
     */
    DoAMutation(context: OperatorContext, cb) {
        var item = new Message();
        item.id = uuid.v4();
        item.ctx = context;
        item.cb = cb;
        this.messages.push(item);
    }

    /**
     * Process messages
     */
    ProcessQueue() {

        for (var clientIndex = 0; clientIndex < this.clients.length; clientIndex++) {
            var availableClient = this.clients.pop(); //clientIndex

            if (this.messages.length > 0) {
                var msg = this.messages.pop();
                msg.clientId = availableClient.id;
                availableClient.connection.send(JSON.stringify(context));
                this.waitingMessages.push(msg);
            }
            else {
                break;
            }
        }
    }
}