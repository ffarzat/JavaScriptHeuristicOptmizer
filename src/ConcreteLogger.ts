/// <reference path="../src/typings/tsd.d.ts" />

import ILogger from './ILogger';
import IConfiguration from './IConfiguration';
import Log4js = require('log4js');
import path = require('path');

/**
 * ConcreteLogger
 */
export default class ConcreteLogger implements ILogger {

     _file: string;
     _category: string;
     _logger: Log4js.Logger;
     

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
       
       this._file = path.join(process.cwd(), configuration.LogFilePath);
       this._category = configuration.LogCategory;
       
       Log4js.configure({
           appenders: [
               { type: 'console', level: Log4js.levels.ALL  },
               { type: 'file', filename: this._file , category: this._category}
            ]
        });
        
       this._logger = Log4js.getLogger(this._category);
       //this._logger.setLevel(Log4js.levels.DEBUG);
        
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
