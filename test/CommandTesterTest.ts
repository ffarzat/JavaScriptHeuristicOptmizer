/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import CommandTester from '../src/CommandTester';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';
import ASTExplorer from '../src/ASTExplorer';
import LogFactory from '../src/LogFactory';

describe('CommandTester Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should execute Tests from uuid Lib', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);


        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);


        //Setup
        var commandTester = new CommandTester();
        commandTester.Setup(configuration.testUntil, lib, configuration.fitType, configuration.clientTimeout * 1000, undefined, 2047, undefined);
        commandTester.SetLogger(logger);

        //Exec the test
        commandTester.Test(individualOverTests);
        //logger.Write(individualOverTests.testResults.outputs.toString());

        expect(individualOverTests.testResults.passedAllTests).to.be(true);
        expect(individualOverTests.testResults).not.to.be(undefined);
        expect(individualOverTests.testResults.duration).not.to.be(undefined);
        expect(individualOverTests.testResults.min).not.to.be(undefined);
        expect(individualOverTests.testResults.max).not.to.be(undefined);
        expect(individualOverTests.testResults.mean).not.to.be(undefined);
        expect(individualOverTests.testResults.median).not.to.be(undefined);
        expect(individualOverTests.testResults.outputs).not.to.be(undefined);
        expect(individualOverTests.testResults.passedAllTests).not.to.be(undefined);
        expect(individualOverTests.testResults.rounds).not.to.be(undefined);
    });
});


/** Calculo to tempo em ms */
function clock(startTime): any {
    if (!startTime) return process.hrtime();
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}

function ToNanosecondsToSeconds(nanovalue): any {
    return parseFloat((nanovalue / 1000000000.0).toFixed(3));
}