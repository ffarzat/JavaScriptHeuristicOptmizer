/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';


describe('ASTExplorer Tests', () => {
    
    it('Should generate Ast from libraries configuration ', () => {
        var astExplorer:ASTExplorer = new ASTExplorer();
        
        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        configuration.libraries.forEach(element => {
            var libFile :string  = element.path;
            //console.log(`       lib: ${element.name}`);
            var generatedAST: Individual = astExplorer.Generate(libFile);
            
            expect(generatedAST).not.be.a('undefined');    
        });
    });    
});