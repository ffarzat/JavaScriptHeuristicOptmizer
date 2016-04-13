/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';

describe('ASTExplorer Tests', function () {

    this.timeout(60*10*1000); //10 minutes

    it('Should Index Nodes From minimist', function () {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[3];
        var libFile :string  = lib.mainFilePath;
        
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        
        var indexes: number [] = astExplorer.IndexNodes(generatedIndividual);
        
        expect(indexes.length).to.be(2954);
    });


    it('Should generate Ast from libraries configuration ', () => {
        var astExplorer:ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        configuration.libraries.forEach(element => {
            var libFile :string  = element.mainFilePath;
            //console.log(`       lib: ${element.name}`);
            var generatedAST: Individual = astExplorer.GenerateFromFile(libFile);

            expect(generatedAST).not.be.a('undefined');
        });

    });  
       
    it('Should Count Nodes From minimist', function () {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[3];
        var libFile :string  = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        
        var total:number = astExplorer.CountNodes(generatedIndividual);
        
        expect(total).to.be(38659);
    });
    
    it('Should Mutate Nodes from minimist lib', function() {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[3]; 
        var libFile :string  = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        //fs.writeFileSync("original.js", generatedIndividual.ToCode());
        
        var context: OperatorContext = new OperatorContext();
        context.First = generatedIndividual;
        var newOne = astExplorer.Mutate(context);
        //fs.writeFileSync("mutantFromTest.js", newOne.ToCode());
        

        //var newTotal:number = astExplorer.CountNodes(generatedIndividual);
        //expect(newTotal).to.be(1235);
        
        //var newOneTotal:number = astExplorer.CountNodes(newOne);
        //expect(newOneTotal).to.be.lessThan(1235);
        
        //expect(newOne.AST).not.equal(generatedIndividual.AST);   
        expect(newOne.ToCode()).not.equal(generatedIndividual.ToCode());
        
            
    });
    
    it('Should Cross over Nodes from minimist lib', function() {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[3];
        var libFile :string  = lib.mainFilePath;
        var originalIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        var total:number = astExplorer.CountNodes(originalIndividual);
        fs.writeFileSync("original.js", originalIndividual.ToCode());
        
        
        var context: OperatorContext = new OperatorContext();
        context.TotalNodesCount = total;
        context.First = originalIndividual.Clone();
        
        var mutantOne = astExplorer.Mutate(context);
        var mutantTwo = astExplorer.Mutate(context);
        
        context.First = mutantOne.Clone();
        context.Second = mutantTwo.Clone();
        
        var newOnes = astExplorer.CrossOver(context);
        
        //console.log(newOnes[0]);
        //console.log(newOnes[1]);
        
        if(newOnes[0] != undefined){
            fs.writeFileSync("CrossOver0.js", newOnes[0].ToCode());
            expect(newOnes[0].ToCode()).not.equal(mutantOne.ToCode());
        }
            
        
        if(newOnes[1] != undefined){
            fs.writeFileSync("CrossOver1.js", newOnes[1].ToCode());
            expect(newOnes[1].ToCode()).not.equal(mutantTwo.ToCode());
        }   
            
        
            
    });
    
      
    
});
