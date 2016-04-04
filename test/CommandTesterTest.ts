/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import CommandTester from '../src/CommandTester';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';
import ASTExplorer from '../src/ASTExplorer';

describe('CommandTester Tests', function () {

    this.timeout(60*10*1000); //10 minutes

    it('Should execute Tests from uuid Lib', function () {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[6]; //uuid

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);

        //Setup
        var commandTester = new CommandTester();
        commandTester.Setup(configuration.testUntil, lib, configuration.fitType);

        //Exec the test
        commandTester.Test(individualOverTests);
        
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
