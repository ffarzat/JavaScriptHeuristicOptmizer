/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import CommandTester from '../src/CommandTester';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';
import ASTExplorer from '../src/ASTExplorer';

describe('CommandTester Tests', function () {
    
    this.timeout(60000);
    
    it('Should execute Tests from Jade Lib', function () {
                
        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[6];
           
        /**
         * Creates a ctx object to test  lib 1 - Jade
         *  */    
        var context: OperatorContext = new OperatorContext();
        context.LibrarieOverTest = lib;
        context.FitnessTopValue = 5000;
        
        //Creates the Inidividual for tests
        var astExplorer:ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.Generate(lib.mainFilePath);
    
        //Setup
        var commandTester = new CommandTester();
        commandTester.Setup(configuration, context);
        
        //Exec the test        
        var fit = commandTester.Test( individualOverTests);
        
      
        expect(fit).to.be.a('number');
        expect(fit).to.be(1);
        
        
    });    
});