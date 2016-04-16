/// <reference path="../src/typings/tsd.d.ts" />

import ILogger from './ILogger';
import IConfiguration from './IConfiguration';

import Log4js = require('log4js');
import fs = require('fs');
import path = require('path');

/**
 * ConcreteLogger
 */
export default class ConcreteLogger implements ILogger {

     _file: string;
     _category: string;
     _logger: Log4js.Logger;
     _clearLogFile: boolean;
     

    /**
     * Pull path for log file
     * 
     */
    File(): string{
        return this._file;
    }
    
    /**
     * Category of logger
     */
    Category(): string{
        return this._category;
    }
    
  /**
   * 
   */
    Initialize(configuration: IConfiguration){
       
       this._file = path.join(process.cwd(), configuration.logFilePath);
       this._category = configuration.logCategory;
       
       if(this._clearLogFile && fs.existsSync( this._file))
       {
           fs.unlinkSync(this._file);
       }
       
       Log4js.configure({
           appenders: [
               { 
                   type: 'console', 
                   level: Log4js.levels.ALL,
                   layout: 
                   {
                        "type": "pattern",
                        "pattern": "%r|%m"
                   }  
               },
               { 
                   type: 'file', 
                   level: Log4js.levels.ALL, 
                   filename: this._file , 
                   category: this._category,
                   layout: 
                   {
                        "type": "pattern",
                        "pattern": "%r|%m"
                   }
                }
            ]
        });
        
       this._logger = Log4js.getLogger(this._category);
    }
    
    /**
     * Writes a message in Log 
     */
    Write(message:string){
        this._logger.trace(message);
    }
    
    /**
     * In this case, nothing
     * 
     */
    Finish(){
        
    }
    
} 
