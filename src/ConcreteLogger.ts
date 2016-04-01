/// <reference path="../src/typings/tsd.d.ts" />

import ILogger from './ILogger';
import IConfiguration from './IConfiguration';
import Log4js = require('log4js');
import path = require('path');

/**
 * ConcreteLogger
 */
export default class ConcreteLogger implements ILogger {

    /**
     * Pull path for log file
     * 
     */
    File: string;
    
    /**
     * Category of logger
     */
    Category: string;
    
  /**
   * 
   */
    Initialize(configuration: IConfiguration){
       
       this.File = path.join(process.cwd(), configuration.LogFilePath);
       this.Category = configuration.LogCategory;
       
       Log4js.configure({
           appenders: [
               { type: 'console' },
               { type: 'file', filename: this.File , category: this.Category }
            ]
        });
        
        var logger = Log4js.getLogger(this.Category);
        
    }
    
    /**
     * Writes a message in Log 
     */
    Write(message:string){
        var logger = Log4js.getLogger(this.Category);
        logger.trace(message);
    }
    
    /**
     * In this case, nothing
     * 
     */
    Finish(){
        
    }
    
} 
