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
        this.logger.Write('Server listening');
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
            this.ValidateRemove(client);

            this.logger.Write(`Left ${this.clients.length} client(s)`);
        });

        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            var msg: Message = JSON.parse(message);
            
            if (this.clients.indexOf(client) == -1) {
                this.clients.push(client); //be available again
                this.Done(client.id, msg);
            }

        });
    }

    /**
     * Mode messages from waitingMessages to messages
    */
    ValidateRemove(client: Client){
         for (var index = 0; index < this.waitingMessages.length; index++) {
            var element = this.waitingMessages[index];
            if(element.clientId == client.id){
                this.waitingMessages.slice(index, 1); //remove
                this.messages.push(element);
                this.logger.Write(`Saving back msg: ${element.id} from client ${client.id}`);
            }
        }
    }



    /**
     * Send a request for any available client to o a mutation over OperatorContext
    */
    DoAMutation(context: OperatorContext, cb: (ctx: Message) => void ) {
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
        
        if(this.clients.length == 0)
            return;

        if(this.messages.length == 0)
            return;


        this.logger.Write(`${this.messages.length} messages left.`)

        for (var clientIndex = 0; clientIndex < this.clients.length; clientIndex++) {
            if (this.messages.length > 0) {
                var availableClient = this.clients.pop(); 
                var msg = this.messages.pop();
                msg.clientId = availableClient.id;
                availableClient.connection.send(JSON.stringify(msg));
                this.waitingMessages.push(msg);
            }
            else {
                break;
            }
        }
    }
    
    /**
     * Relases the callback magic
     */
    Done(clientId: string, message: Message){
        
        //Finds message index
        for (var index = 0; index < this.waitingMessages.length; index++) {
            var element = this.waitingMessages[index];
            if(element.id == message.id)
                break;
        }

        var localmsg = this.waitingMessages[index];
        this.waitingMessages.splice(index, 1); //cut off
        localmsg.cb(message); //do the callback!
    }
}

