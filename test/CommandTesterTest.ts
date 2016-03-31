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

        /**
         * Creates a ctx object to test  lib 1 - Jade
         *  */
        var context: OperatorContext = new OperatorContext();
        context.LibrarieOverTest = lib;
        context.FitnessTopValue = 9999999999999;

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);

        //Setup
        var commandTester = new CommandTester();
        commandTester.Setup(configuration, context);

        //Exec the test
        var testResults = commandTester.Test(individualOverTests);
        
        expect(testResults).not.to.be(undefined);
        expect(testResults.duration).not.to.be(undefined);
        expect(testResults.min).not.to.be(undefined);
        expect(testResults.max).not.to.be(undefined);
        expect(testResults.mean).not.to.be(undefined);
        expect(testResults.median).not.to.be(undefined);
        expect(testResults.outputs).not.to.be(undefined);
        expect(testResults.passedAllTests).not.to.be(undefined);
        expect(testResults.rounds).not.to.be(undefined);
    });
});
