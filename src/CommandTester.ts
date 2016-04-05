/// <reference path="../src/typings/tsd.d.ts" />

import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import Library from './Library';
import TestResults from './TestResults';
import ILogger from './ILogger';

import path = require('path');
import Shell = require('shelljs');
import fs = require('fs');
import fse = require('fs-extra');

var uuid = require('node-uuid');
var exectimer = require('exectimer');

/**
 * CommandTester
 */
export default class CommandTester implements ITester {

    //Number of times to run tests over a single individual
    testUntil: number;
    //Main file of Library
    libMainFilePath: string;
    //Directory to run NPM Test command
    libDirectoryPath: string;
    //Actual dir
    testOldDirectory:string;
    //Attr for Fit evaluation
    fitType: string;
    
    logger: ILogger;
    
    oldLibFilePath: string;
    

    /**
     * Initializes NPM packages if necessary
     */
    Setup(testUntil: number, LibrarieOverTest: Library, fitType: string) {

        this.testUntil = testUntil;

        //Setup tests with Lib context
        this.libMainFilePath = LibrarieOverTest.mainFilePath;
        this.libDirectoryPath = path.join(process.cwd(), LibrarieOverTest.path);
        this.testOldDirectory = process.cwd();
        this.fitType = fitType;
        this.oldLibFilePath = path.join(this.libDirectoryPath, 'old.js');
        
        if(!fse.existsSync(this.oldLibFilePath))
            fse.copySync(this.libMainFilePath, this.oldLibFilePath, {"clobber": true});
        
    }

    /**
     * Knows what attribute uses for Fit evaluation
     */
    RetrieveConfiguratedFitFor(individual: Individual): number{
        return individual.testResults[this.fitType];
    }

    /**
     * Do the test for an individual
     */
    Test(individual: Individual)  {
        //output new code over main file js
        this.WriteCodeToFile(individual);
        var outputsFromCmd: string[] = [];
        var passedAllTests = true;
        var testUuid = uuid.v4();
        try {
            process.chdir(this.libDirectoryPath);
            
            var Tick = exectimer.Tick;
            
            this.logger.Write(`Doing ${this.testUntil} evaluations`);
            
            for (var index = 0; index < this.testUntil; index++) {
            
                var testExecutionTimeTick = new Tick(testUuid);
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
            fse.copySync(this.oldLibFilePath, this.libMainFilePath, {"clobber": true});
        }
                
        var unitTestsTimer = exectimer.timers[testUuid];
        
        if(passedAllTests)
        {
            var results:TestResults = new TestResults();
            results.rounds = this.testUntil;
            results.min = unitTestsTimer.min();
            results.max = unitTestsTimer.max();
            results.mean = unitTestsTimer.mean();
            results.median = unitTestsTimer.median();
            results.duration = unitTestsTimer.duration();
            results.outputs = outputsFromCmd;
            results.passedAllTests = passedAllTests

            individual.testResults = results;
        }
        else
        {
            var results:TestResults = new TestResults();
            results.rounds = this.testUntil;
            
            results.min = 0;
            results.max = 0;
            results.mean = 0;
            results.median = 0;
            results.duration = 0;
            results.outputs = outputsFromCmd;
            results.passedAllTests = passedAllTests

            individual.testResults = results;
        }
        
        this.logger.Write(`All Tests: ${passedAllTests}`);
        this.ShowConsoleResults(unitTestsTimer);
    }

    /**
     * Return a copy ready for testing again
     */
    Clone(): ITester {
        var tester = new CommandTester();
        tester.testUntil = this.testUntil;

        //Setup tests with Lib context
        tester.libMainFilePath = this.libMainFilePath;
        tester.libDirectoryPath = this.libDirectoryPath;
        tester.testOldDirectory = this.testOldDirectory;
        
        return tester;
    }

    /**
     * Just for Debug
     */
    private ShowConsoleResults(timer:any){
        //this.logger.Write('Results:');
        this.logger.Write('total duration:' + timer.parse(timer.duration())); // total duration of all ticks
        this.logger.Write('min:' + timer.parse(timer.min()));      // minimal tick duration
        this.logger.Write('max:' + timer.parse(timer.max()));      // maximal tick duration
        this.logger.Write('mean:' + timer.parse(timer.mean()));     // mean tick duration
        this.logger.Write('median:' + timer.parse(timer.median()));   // median tick duration
    }

    /**
     * Writes the new code Over old Main File of the lib over tests
     */
    private WriteCodeToFile(individual: Individual) {
        //this.logger.Write(`Saving over file ${this.libMainFilePath}`);
        fs.writeFileSync(this.libMainFilePath, individual.ToCode());
    }

    /**
     * Updating logger
     *  */    
    SetLogger(logger: ILogger){
        this.logger = logger;
    }

}
