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
       
    it('Should Count Nodes From Lodash', function () {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[2];
        var libFile :string  = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        
        var total:number = astExplorer.CountNodes(generatedIndividual);
        
        expect(total).to.be(26048);
    });
    
    it('Should Mutate Nodes from uuid lib', function() {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[6]; // uuid;
        var libFile :string  = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        
        var total:number = astExplorer.CountNodes(generatedIndividual);
        
        
        var context: OperatorContext = new OperatorContext();
        context.TotalNodesCount = total;
        context.First = generatedIndividual;
        var newOne = astExplorer.Mutate(context);

        var newTotal:number = astExplorer.CountNodes(generatedIndividual);
        expect(newTotal).to.be(1267);
        
        var newOneTotal:number = astExplorer.CountNodes(newOne);
        expect(newOneTotal).to.be.lessThan(1267);
        
        expect(newOne.AST).not.equal(generatedIndividual.AST);   
        
        expect(newOne.ToCode()).not.equal(generatedIndividual.ToCode());
        
            
    });
    
    it('Should Cross over Nodes from uuid lib', function() {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[6]; // uuid;
        var libFile :string  = lib.mainFilePath;
        var originalIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        var total:number = astExplorer.CountNodes(originalIndividual);
        
        
        
        var context: OperatorContext = new OperatorContext();
        context.TotalNodesCount = total;
        context.First = originalIndividual.Clone();
        
        var mutant = astExplorer.Mutate(context);
        context.Second = mutant.Clone();
        
        var newOnes = astExplorer.CrossOver(context);

        var newTotal:number = astExplorer.CountNodes(originalIndividual);
        expect(newTotal).to.be(1267);
        
        var firstNew: number = astExplorer.CountNodes(newOnes[0]);
        expect(firstNew).not.to.be.equal(1267);
        
        var secondNew: number = astExplorer.CountNodes(newOnes[1]);
        expect(secondNew).not.to.be.equal(1267);
        
        expect(newOnes[0].AST).not.equal(originalIndividual.AST);   
        expect(newOnes[0].ToCode()).not.equal(originalIndividual.ToCode());
        
        expect(newOnes[1].AST).not.equal(originalIndividual.AST);   
        expect(newOnes[1].ToCode()).not.equal(originalIndividual.ToCode());
        
            
    });
    
      
    
});
