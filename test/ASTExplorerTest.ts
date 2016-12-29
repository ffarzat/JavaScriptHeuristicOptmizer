/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';

describe('ASTExplorer Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should Index Nodes From uuid', function () {

        var astExplorer: ASTExplorer = new ASTExplorer();


        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
        var libFile: string = lib.mainFilePath;

        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var indexes: number[] = astExplorer.IndexNodes(generatedIndividual);

        expect(indexes.length).to.be(2998);
    });


    it('Should generate Ast from libraries configuration ', () => {
        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        configuration.libraries.forEach(element => {
            var libFile: string = element.mainFilePath;
            //console.log(`       lib: ${element.name}`);
            var generatedAST: Individual = astExplorer.GenerateFromFile(libFile);

            expect(generatedAST).not.be.a('undefined');
        });

    });

    it('Should Count Nodes From uuid', function () {

        var astExplorer: ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var total: number = astExplorer.CountNodes(generatedIndividual);

        expect(total).to.be(39190);
    });

    it('Should Mutate Nodes from uuid lib', function () {

        var astExplorer: ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        //fs.writeFileSync("original.js", generatedIndividual.ToCode());

        var context: OperatorContext = new OperatorContext();
        context.First = generatedIndividual;
        context.MutationTrials = configuration.mutationTrials;
        var newOne = astExplorer.Mutate(context);
        //fs.writeFileSync("mutantFromTest.js", newOne.ToCode());

        expect(newOne.ToCode()).not.equal(generatedIndividual.ToCode());
    });

    it('Should Mutate Nodes by Index  from uuid lib', function () {

        var astExplorer: ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        //fs.writeFileSync("original.js", generatedIndividual.ToCode());

        var indexes = astExplorer.IndexNodes(generatedIndividual);
        //console.log(indexes[1]);

        var context: OperatorContext = new OperatorContext();
        context.First = generatedIndividual;
        context.NodeIndex = indexes[1];
        context.MutationTrials = configuration.mutationTrials;

        var newOne = astExplorer.MutateBy(context);

        //fs.writeFileSync("mutantIndexFromTests.js", newOne.ToCode());
        expect(newOne.ToCode()).not.equal(generatedIndividual.ToCode());
    });
    /*
    it('Should Cross over Nodes from underscore lib', function() {
        
        var astExplorer:ASTExplorer = new ASTExplorer();
        var context: OperatorContext = new OperatorContext();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[0];
        var libFile :string  = lib.mainFilePath;
        var originalIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        var total:number = astExplorer.CountNodes(originalIndividual);
        //fs.writeFileSync("original.js", originalIndividual.ToCode());
        
        var context: OperatorContext = new OperatorContext();
        context.First = originalIndividual.Clone();
        
        var mutantOne = astExplorer.Mutate(context);
        var mutantTwo = astExplorer.Mutate(context);
        
        context.First = mutantOne.Clone();
        context.Second = mutantTwo.Clone();
        context.CrossOverTrials = configuration.crossOverTrials;
        
        var newOnes = astExplorer.CrossOver(context);

        //fs.writeFileSync("CrossOver0.js", newOnes[0].ToCode());
        expect(newOnes[0].ToCode()).not.equal(originalIndividual.ToCode());
    
        //fs.writeFileSync("CrossOver1.js", newOnes[1].ToCode());
        expect(newOnes[1].ToCode()).not.equal(originalIndividual.ToCode());            
    });
    */

    it('Should Making the Static Function Ranking', function () {

        var astExplorer: ASTExplorer = new ASTExplorer();


        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[0];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var functionDic = astExplorer.MakeFunctionStaticRanking(generatedIndividual);

        for (var functionName in functionDic) {
            console.log(`${functionName}: ${functionDic[functionName]}`);
            expect(functionDic[functionName]).not.equal(0);
        }

    });


});
