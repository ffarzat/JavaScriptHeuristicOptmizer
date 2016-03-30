/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
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
            var libFile :string  = element.mainFilePath;
            //console.log(`       lib: ${element.name}`);
            var generatedAST: Individual = astExplorer.Generate(libFile);
            
            expect(generatedAST).not.be.a('undefined');    
        });
    });    
    
    
    it('Should generate Exactly same code for uuid lib ', () => {
        var astExplorer:ASTExplorer = new ASTExplorer();
        
        var configurationFile: string = process.cwd() + '\\test\\Configuration.json';
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var jadeLib = configuration.libraries[6];            
        var individualGenerated: Individual = astExplorer.Generate(jadeLib.mainFilePath); 
        
        expect(individualGenerated).not.be.a('undefined');
        
        var oldCode:string = fs.readFileSync(jadeLib.mainFilePath, 'UTF-8');
        var newCode = individualGenerated.ToCode();
        
        oldCode = oldCode.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/, "") ;
        newCode = newCode.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/, "") ;
        
        expect(newCode).to.be.equal(oldCode);
        
    });
    
    
});
