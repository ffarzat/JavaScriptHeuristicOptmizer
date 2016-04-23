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
            this.clients.push(client);
            
            this.logger.Write('Connection accepted [' + id + ']');
            this.HandleConnections(client);
            
            this.SendDataTest("Do a Mutation for me?"); //=============================================================== TEST!!!!
            
        });
        
        this.wsServer.on("message", ()=>{
            
        });
        
    }
    
    /**
     * Handle Client Events
     */
    private HandleConnections(client: Client){
        
        //Handle on close
        client.connection. on('close', (reasonCode, description)=> {
            this.logger.Write('Peer ' + client.id + ' disconnected.');
            delete this.clients[client.id]; //remove from list
        });    
        
        //Handle on messagem from cliente!
        client.connection.on('message', (message) => {
            this.logger.Write(`${message}`);
        });
        
    }
    
    SendDataTest(msg: string){
        this.clients[0].connection.send(msg);
    }
    
}