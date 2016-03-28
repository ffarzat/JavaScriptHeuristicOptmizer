/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import expect = require('expect.js');
import path = require('path');

import NPMTester from '../src/NPMTester';
import IConfiguration from '../src/IConfiguration';
import Individual from '../src/Individual';

describe('Individual Tests', () => {
    
    it('Should run Tests from all libs ', () => {

        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        configuration.libraries.forEach(element => {
            
            var libFile :string  = element.path;
            var directoryToRunTest: string = path.dirname(libFile);   
            var oldCwd = process.cwd();
            process.chdir(directoryToRunTest);
            
            var individual = new Individual();
            
            var npmtester = new NPMTester();
            npmtester.Setup(configuration);
            
            var fit = npmtester.Test(individual);
            
            process.chdir(oldCwd);
            
            expect(fit).not.be.a('undefined');
            expect(fit).to.be.a('number');
             
        });
    });    
})