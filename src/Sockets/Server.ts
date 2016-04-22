import IConfiguration from '../IConfiguration';
import ILogger from '../ILogger';
import Client from './Client';

import WebSocketServer = require('websocket');
var http = require('http');


/**
 * Server to control the optmization process
 */
export default class Server {
    
    wsServer: WebSocketServer.server ; //new require('websocket').server
    port: number;
    url: string;
    logger: ILogger;
    httpServer: any; //http.createServer()
    
    clients: Client [] = [] ; //store available clients
    
    /**
     * Configs the server to execute
     */
    Setup(configuration: IConfiguration): void{
        
        this.port = configuration.port;
        this.url = configuration.url;
        
        this.httpServer = http.createServer(function(request, response) {});
        this.httpServer.listen(this.port, ()=> {
            this.logger.Write('Server is listening on port:' + this.port);
        });
        
        
        this.wsServer = new WebSocketServer.server({httpServer: this.httpServer});
        this.HandleServer();
               
    }
    
    /**
     * Handle Server Events
     */
    private HandleServer(){
        
        //Handle on request
        this.wsServer.on('request', (request: WebSocketServer.request) =>{
            var connection = request.accept('echo-protocol', request.origin);
            var id = this.clients.length;
            
            var client = new Client();
            client.id = id;
            client.connection = connection;
            client.available = true;
            this.clients.push(client);
            
            this.logger.Write('Connection accepted [' + id + ']');
            this.HandleConnections(client);
            
            this.SendDataTest("From run.js"); //=============================================================== TEST!!!!
            
        });
        
        this.wsServer.on("message", ()=>{
            
        });
        
    }
    
    /**
     * Handle Client Events
     */
    private HandleConnections(client: Client){
        
        //Handle on close
        client.connection. on('close', function(reasonCode, description) {
            this.logger.Write('Peer ' + client.connection.remoteAddress + ' disconnected.');
            delete this.clients[client.id]; //remove from list
        });    
        
        //Handle on close
        client.connection. on('message', (message) =>{
            this.logger.Write(`${message.utf8Data}`);
        });
        
    }
    
    SendDataTest(msg: string){
        this.clients[0].connection.send(msg);
    }
    
}