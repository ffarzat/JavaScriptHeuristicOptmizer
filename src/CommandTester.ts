/// <reference path="../src/typings/tsd.d.ts" />

import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import Library from './Library';

import path = require('path');
import Shell = require('shelljs');
var exectimer = require('exectimer');
import fs = require('fs');


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

        //fse.copySync(jadeLib.path, path.join(jadeLibDirectory, 'oldCode.js'));
    }

    /**
     * Do the test for an individual
     */
    Test(individual: Individual): number {

        var agvFit = 1;   //avg of all runs

        //output new code over main file js
        this.WriteCodeToFile(individual);

        //TODO: Try/catch
        process.chdir(this.libDirectoryPath);

        var ExecutionCode = (Shell.exec('npm test', {silent:false}) as Shell.ExecOutputReturnValue).code;

        process.chdir(this.testOldDirectory);

        if (ExecutionCode > 0)
            return this.fitnessTopValue;

        return agvFit;
    }

    /**
     * Backs to initial state
     */
    Clean() {

    }

    /**
     * Writes the new code Over old Main File of the lib over tests
     */
    private WriteCodeToFile(individual: Individual) {
        fs.writeFileSync(this.libMainFilePath, individual.ToCode());
    }

}
