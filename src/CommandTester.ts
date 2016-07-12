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
    testOldDirectory: string;
    //Attr for Fit evaluation
    fitType: string;

    logger: ILogger;

    oldLibFilePath: string;

    Ncpus: number;
    hostfile: string;
    testTimeout: number;


    /**
     * Initializes NPM packages if necessary
     */
    Setup(testUntil: number, LibrarieOverTest: Library, fitType: string, cpus: number, hostfile: string, testTimeout: number) {

        this.testUntil = testUntil;
        this.testTimeout = testTimeout;

        //Setup tests with Lib context
        this.libMainFilePath = LibrarieOverTest.mainFilePath;
        this.libDirectoryPath = LibrarieOverTest.path;
        this.testOldDirectory = process.cwd();
        this.fitType = fitType;
        this.oldLibFilePath = path.join(this.libDirectoryPath, 'old.js');

        this.Ncpus = cpus;
        this.hostfile = hostfile;

        if (!fse.existsSync(this.oldLibFilePath))
            fse.copySync(this.libMainFilePath, this.oldLibFilePath, { "clobber": true });

    }

    /**
     * Knows what attribute uses for Fit evaluation
     */
    RetrieveConfiguratedFitFor(individual: Individual): number {
        return individual.testResults[this.fitType];
    }

    /**
     * Do the test for an individual
     */
    Test(individual: Individual) {

        var outputsFromCmd: string[] = [];
        var passedAllTests = true;

        var max;
        var min;
        var avg;
        var median;

        try {
            //output new code over main file js
            this.WriteCodeToFile(individual);

            /* FOR MPIRUN using */
            var os = require("os");
            const child_process = require('child_process');

            console.log(`Ncpus: ${this.Ncpus}`);
            console.log(`hostfile: ${this.hostfile}`);

            var cpusString = fs.readFileSync(this.hostfile).toString().split("\n");
            console.log(`Ncpus == ${cpusString.length}`);
            console.log(`Test Host #1: ${cpusString[48]}`);


            //var clientsTotal = 9;
            var libPath = this.libDirectoryPath;
            var timeoutMS = this.testTimeout;
            var testUntil = this.testUntil;
            console.log(`libPath: ${id}`);
            console.log(`timeoutMS: ${libPath}`);
            console.log(`testUntil: ${timeoutMS}`);



            var messagesToProcess = [];
            var actualHost = cpusString[48];

            var msgId = uuid.v4();
            var testCMD = `mpirun -np ${testUntil} -host ${cpusString[48]} -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 src/client.js ${msgId} ${libPath} ${timeoutMS}`;

            if (this.hostfile === "") {
                testCMD = `node --expose-gc --max-old-space-size=2047 src/client.js ${msgId} ${libPath} ${timeoutMS}`;
            }

            var stdout = child_process.execSync(testCMD, { maxBuffer: 1024 * 5000 }).toString();

            var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
            stringList = stringList.substring(0, stringList.length - 1);
            //console.log(`[${stringList}]`);

            var list = JSON.parse(`[${stringList}]`);
            var numbers = [];
            for (var index = 0; index < list.length; index++) {
                var element = list[index];
                numbers.push(element.duration);
            }

            max = Math.max.apply(null, numbers);
            min = Math.min.apply(null, numbers);
            avg = this.mean(numbers);
            median = this.median(numbers);

            //console.log(`Min: ${ToSecs(min)}`);
            //console.log(`Max: ${ToSecs(max)}`);
            //console.log(`Mean: ${ToSecs(avg)}`);
            //console.log(`Median: ${ToSecs(median)}`);
            //console.log(`Duration: ${ToSecs(max)}`); // Now is Max

            /* FOR MPIRUN using */

        } catch (error) {
            this.logger.Write(error);
            passedAllTests = false;
        }
        finally {
            fse.copySync(this.oldLibFilePath, this.libMainFilePath, { "clobber": true });
        }

        if (passedAllTests) {
            var results: TestResults = new TestResults();
            results.rounds = this.testUntil;
            results.min = min;
            results.max = max;
            results.mean = avg;
            results.median = median;
            results.duration = max;
            results.outputs = outputsFromCmd;
            results.passedAllTests = passedAllTests

            individual.testResults = results;
            results.fit = this.RetrieveConfiguratedFitFor(individual);
        }
        else {
            var results: TestResults = new TestResults();
            results.rounds = this.testUntil;

            results.min = 0;
            results.max = 0;
            results.mean = 0;
            results.median = 0;
            results.duration = 0;
            results.outputs = outputsFromCmd;
            results.fit = 0;
            results.passedAllTests = passedAllTests
            individual.testResults = results;
        }

        this.ShowConsoleResults(results);
    }

    /**
     * Return a copy ready for testing again
     */
    Clone(): ITester {
        var tester = new CommandTester();
        tester.testUntil = this.testUntil;
        tester.testTimeout = this.testTimeout;

        //Setup tests with Lib context
        tester.libMainFilePath = this.libMainFilePath;
        tester.libDirectoryPath = this.libDirectoryPath;
        tester.testOldDirectory = this.testOldDirectory;

        tester.fitType = this.fitType;
        tester.oldLibFilePath = this.oldLibFilePath;

        tester.Ncpus = this.Ncpus;
        tester.hostfile = this.hostfile;

        return tester;
    }

    /**
     * Just for Debug
     */
    private ShowConsoleResults(result: TestResults) {
        this.logger.Write('Results:');
        this.logger.Write('total duration:' + result.duration); // total duration of all ticks
        this.logger.Write('min:' + result.min);      // minimal tick duration
        this.logger.Write('max:' + result.max);      // maximal tick duration
        this.logger.Write('mean:' + result.mean);     // mean tick duration
        this.logger.Write('median:' + result.median);   // median tick duration
        this.logger.Write('FIT:' + result.fit);      // configurated calculated FIT 
    }

    /**
     * Writes the new code Over old Main File of the lib over tests
     */
    private WriteCodeToFile(individual: Individual) {
        //this.logger.Write(`Saving over file ${this.libMainFilePath}`);
        fs.writeFileSync(this.libMainFilePath, individual.ToCode());
    }

    SetTmeout(ms: number) {
        this.testTimeout = ms;
    }

    /**
     * simple median
     */
    private median(values) {

        values.sort(function (a, b) { return a - b; });

        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];
        else
            return (values[half - 1] + values[half]) / 2.0;
    }

    /**
     * simple mean
     */
    private mean(numbers) {
        var total = 0, i;
        for (i = 0; i < numbers.length; i++) {
            total += numbers[i];
        }
        return total / numbers.length;
    }

    /**
     * From ms to sec
     */
    private ToSecs(number) {
        return (number / 1000) % 60;
    }


    /**
     * Updating logger
     *  */
    SetLogger(logger: ILogger) {
        this.logger = logger;
    }

    /**
     * Transform nano secs in secs
     */
    private ToNanosecondsToSeconds(nanovalue: number): number {
        return parseFloat((nanovalue / 1000000000.0).toFixed(1));
    }

}
