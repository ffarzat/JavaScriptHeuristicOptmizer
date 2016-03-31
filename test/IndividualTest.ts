/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';

describe('Individual Tests', () => {

    it('Should generate Code from libraries AST ', () => {
        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        configuration.libraries.forEach(element => {
            var libFile: string  = element.mainFilePath;
            //console.log(`       lib: ${element.name}`);
            var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

            expect(generatedIndividual).not.be.a('undefined');
            expect(generatedIndividual.AST ).not.be.a('undefined');

            var generatedCode = generatedIndividual.ToCode();
            //console.log(generatedCode);

            expect(generatedCode).not.be.a('undefined');
            expect(generatedCode).to.be.a('string');

        });
    });
    
    it('Should Clone itself ', () => {
        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[0];
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);
        expect(generatedIndividual).not.be.a('undefined');
        expect(generatedIndividual.AST ).not.be.a('undefined');
        
        var generatedClone: Individual = generatedIndividual.Clone();
        
        expect(generatedIndividual).not.be.equal(generatedClone);
        
        var Total:number = astExplorer.CountNodes(generatedIndividual);
        var CloneTotal:number = astExplorer.CountNodes(generatedClone);
        
        expect(Total).to.be.equal(CloneTotal);
    });
    
});
