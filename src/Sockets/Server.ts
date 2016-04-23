import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import Client from './Client';

import WebSocketServer = require('ws');


/**
 * Server to control the optmization process
 */
export default class Server {
    
    wsServer: WebSocketServer.Server ; //new require('websocket').server
    port: number;
    url: string;
    logger: ILogger;
    
    clients: Client [] = [] ; //store available clients
    
    /**
     * Configs the server to execute
     */
    Setup(configuration: IConfiguration): void{
        
        this.port = configuration.port;
        this.url = configuration.url;
        
        this.wsServer = new WebSocketServer.Server({port: this.port});
        this.HandleServer();      
    }
    
    /**
     * Handle Server Events
     */
    private HandleServer(){
          
        //Handle on request
        this.wsServer.on('connection', (connection) => {
            var id = connection.upgradeReq.url.replace("/ID=", "");
            
            var client = new Client();
            client.id = id;
            client.connection = connection;
            client.available = true;
            this.clients[id] = client;
            
            this.logger.Write('Connection accepted [' + id + ']');
            this.HandleConnections(client);
            
            client.connection.send('Do a mutation for me?'); //=============================================================== TEST!!!!
            
        });
                
    }
    
    /**
     * Handle Client Events
     */
    private HandleConnections(client: Client){
        
        //Handle on close
        client.connection. on('close', (reasonCode, description)=> {
            this.logger.Write('Peer ' + client.id + ' disconnected.');
            
            var index = this.clients.indexOf(client);
            this.clients.splice(index, 1);  //remove from availables
            
            this.logger.Write(`Left ${this.clients.length} client(s)`); 
        });    
        
        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            this.logger.Write(`${message}`);
        });
        
    } 
}