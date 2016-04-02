/// <reference path="../src/typings/tsd.d.ts" />

import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import Library from './Library';
import TestResults from './TestResults';

import path = require('path');
import Shell = require('shelljs');
var exectimer = require('exectimer');
import fs = require('fs');
import fse = require('fs-extra');


/**
 * CommandTester
 */
export default class CommandTester implements ITester {
    config: IConfiguration;

    //Number of times to run tests over a single individual
    testUntil: number;
    //Main file of Library
    libMainFilePath: string;
    //Directory to run NPM Test command
    libDirectoryPath: string;
    //Actual dir
    testOldDirectory:string;
    fitnessTopValue:number;

    /**
     * Initializes NPM packages if necessary
     */
    Setup(configuration: IConfiguration, context: OperatorContext){

        this.config = configuration;
        this.testUntil = configuration.testUntil;

        //Setup tests with Lib context
        var lib = context.LibrarieOverTest;
        this.libMainFilePath = lib.mainFilePath;
        this.libDirectoryPath = path.join(process.cwd(), lib.path);
        this.testOldDirectory = process.cwd();
        this.fitnessTopValue = context.FitnessTopValue;

        //fse.copySync(lib.mainFilePath, path.join(lib.path, '_oldCode.js'));
    }

    /**
     * Do the test for an individual
     */
    Test(individual: Individual): TestResults {
        //output new code over main file js
        this.WriteCodeToFile(individual);
        var outputsFromCmd: string[] = [];
        var passedAllTests = true;
        
        try {
            process.chdir(this.libDirectoryPath);
            
            var Tick = exectimer.Tick;
            
            for (var index = 0; index < this.testUntil; index++) {
            
                var testExecutionTimeTick = new Tick("unitTests");
                testExecutionTimeTick.start();
                var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec('npm test', {silent:true}) as Shell.ExecOutputReturnValue);
                testExecutionTimeTick.stop();    
                
                //TODO: Log the returnedOutput.output for debug
                outputsFromCmd.push(returnedOutput.output);
                
                if (returnedOutput.code > 0)
                {
                    passedAllTests = false;
                    break;
                }        
            }    
        } catch (error) {
            console.log(error);
            passedAllTests = false;
        }
        finally{
            process.chdir(this.testOldDirectory);    
        }
                
        var unitTestsTimer = exectimer.timers.unitTests;
        //this.ShowConsoleResults(unitTestsTimer);
        
        
        var results:TestResults = new TestResults();
        results.rounds = this.testUntil;
        results.min = unitTestsTimer.min();
        results.max = unitTestsTimer.max();
        results.mean = unitTestsTimer.mean();
        results.median = unitTestsTimer.median();
        results.duration = unitTestsTimer.duration();
        results.outputs = outputsFromCmd;
        results.passedAllTests = passedAllTests

        return results;
    }

    /**
     * Backs to initial state when necessary
     */
    Clean() {
        
        

    }

    /**
     * Just for Debug
     */
    private ShowConsoleResults(timer:any){
        
        console.log('       total duration:' + timer.parse(timer.duration())); // total duration of all ticks
        console.log('       min:' + timer.parse(timer.min()));      // minimal tick duration
        console.log('       max:' + timer.parse(timer.max()));      // maximal tick duration
        console.log('       mean:' + timer.parse(timer.mean()));     // mean tick duration
        console.log('       median:' + timer.parse(timer.median()));   // median tick duration
    }

    /**
     * Writes the new code Over old Main File of the lib over tests
     */
    private WriteCodeToFile(individual: Individual) {
        fs.writeFileSync(this.libMainFilePath, individual.ToCode());
    }

}