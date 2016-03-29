/// <reference path="../src/typings/tsd.d.ts" />

import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import Shell = require('shelljs');

var exectimer = require('exectimer');

/**
 * CommandTester
 */
export default class CommandTester implements ITester {
    config: IConfiguration;
    
    testUntil: number;
    
   
    /**
     * Initializes NPM packages if necessary
     */
    Setup(configuration: IConfiguration){
        
        this.config = configuration;
        
        this.testUntil = configuration.testUntil;
        
    }
    
    /**
     * Do the test for an individual
     */
    Test(individual: Individual): number{
        
        var fit = 10000000000;
        var ExecutionCode = (Shell.exec('npm test', {silent:false}) as Shell.ExecOutputReturnValue ).code;
        
        //console.log(`       Erro: ${ExecutionCode}`);
        
        if(ExecutionCode > 0)
            return fit;
            
        return 1;
    }
    
     /**
     * Backs to initial state
     */
    Clean(){
        
    }
    
}