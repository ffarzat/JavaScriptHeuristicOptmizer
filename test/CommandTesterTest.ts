/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import expect = require('expect.js');
import path = require('path');

import IConfiguration from '../src/IConfiguration';
import CommandTester from '../src/CommandTester';
import Individual from '../src/Individual';

describe('CommandTester Tests', function () {
    
    this.timeout(60000);
    
    it('Should execute Tests from all libs ', function () {
                
        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
    
        var libFile :string  = lib.path;
        
        var oldDir = process.cwd();
        
        process.chdir(path.dirname(libFile));
    
        var commandTester = new CommandTester();
        commandTester.Setup(configuration);
        
        var fit = commandTester.Test(new Individual());
        
        process.chdir(oldDir);
        
        expect(fit).to.be.a('number');
        expect(fit).to.be(1);
        
        
    });    
});