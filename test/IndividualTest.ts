/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';

describe('Individual Tests', () => {
    
    it('Should generate Code from libraries AST ', () => {
        var astExplorer:ASTExplorer = new ASTExplorer();
        
        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        configuration.libraries.forEach(element => {
            var libFile :string  = element.mainFilePath;
            //console.log(`       lib: ${element.name}`);
            var generatedIndividual: Individual = astExplorer.Generate(libFile);

            expect(generatedIndividual).not.be.a('undefined');  
            expect(generatedIndividual.AST ).not.be.a('undefined');
            
            var generatedCode = generatedIndividual.ToCode(); 
            //console.log(generatedCode);
            
            expect(generatedCode).not.be.a('undefined');
            expect(generatedCode).to.be.a('string');
             
        });
    });    
});

