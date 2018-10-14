/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';


import IHeuristic from '../src/heuristics/IHeuristic';
import HeuristicFactory from '../src/heuristics/HeuristicFactory';
import GA from '../src/heuristics/GA';
import RD from '../src/heuristics/RD';
import HC from '../src/heuristics/HC';
import NodeIndex from '../src/heuristics/NodeIndex';

import LogFactory from '../src/LogFactory';
import CommandTester from '../src/CommandTester';

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

        expect(indexes.length).to.be(2984);
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
        expect(generatedIndividual.removedIDS.length).equal(0);
        expect(newOne.removedIDS.length).equal(1);
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
        expect(newOne.removedIDS).not.equal(generatedIndividual.removedIDS);
        expect(generatedIndividual.removedIDS.length).equal(0);
        expect(newOne.removedIDS.length).equal(1);
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

    /*
    it('Should run ReplaceFunctionNode', (done) => {

        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[2];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);

        //Patch for execution over NACAD PBS 
        if (process.platform !== "win32") {
            process.env['TMPDIR'] = configuration.tmpDirectory;
        }

        expect(lib.name).to.be("lodash");

        var functionName = "SemUso";
        var functionAST = astExplorer.GetFunctionAstByName(generatedIndividual, functionName);

        //Remover o 4 call gera uma nova função válida que passa nos testes
        var clientOptions = '--max-old-space-size=' + (configuration.memory == undefined ? 2047 : configuration.memory);
        var pool = require('fork-pool');
        var uniquePool = new pool(__dirname + '/../src/Child.js', ['/test/Configuration.json'], { execArgv: [clientOptions] }, { size: configuration.clientsTotal + 1, log: false, timeout: configuration.copyFileTimeout * 1000 });
        var hc = <HC>new HeuristicFactory().CreateByName('HC');
        hc.Setup(configuration.trialsConfiguration[0].especific, configuration, []);
        hc.Name = "HC";
        hc._logger = logger;
        hc.Trials = configuration.trials;
        hc.Pool = uniquePool;
        hc._lib = lib;
        hc.ActualBestForFunctionScope = generatedIndividual.Clone();
        hc.Original = generatedIndividual.Clone();
        hc.bestIndividual = functionAST;
        hc.ActualFunction = functionName;
        hc.nodesSelectionApproach = "ByFunction";
        hc.nodesType = ['CallExpression'];


        var nodesIndexList = hc.DoIndexes(functionAST);
        var indexes: NodeIndex = nodesIndexList[0];
        //indexes.ActualIndex = 0; //4 call

        hc.MutateBy(functionAST, indexes, (mutante: Individual) => {

            expect(mutante.testResults).not.be(undefined);
            expect(mutante.testResults.passedAllTests).not.be(false);

            done();
        });
    });
    */

    it('Should run GetFunctionAstByName', () => {

        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[2];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var functionAST = astExplorer.GetFunctionAstByName(generatedIndividual, 'lazyValue');

        //console.log(functionAST.ToCode());

        expect(functionAST).not.be(undefined);

    });

    it('Should MutateBy ExpressionStatement Nodes only', () => {

        var astExplorer: ASTExplorer = new ASTExplorer();

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1]; //UUID
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

        var indices = astExplorer.IndexNodesBy(["AssignmentExpression"], generatedIndividual);

        var ctx: OperatorContext = new OperatorContext();
        ctx.First = generatedIndividual;
        ctx.NodeIndex = indices['AssignmentExpression'];

        var mutante = astExplorer.MutateBy(ctx);
        
        //fs.writeFileSync("original.js", generatedIndividual.ToCode());
        //fs.writeFileSync("mutantIndexFromTests.js", mutante.ToCode());

        expect(indices).not.be(undefined);
        expect(indices['AssignmentExpression']).not.be(undefined);
        expect(indices['AssignmentExpression']['Type']).to.be('AssignmentExpression');
        expect(indices['AssignmentExpression']['ActualIndex']).to.be(0);
        expect(indices['AssignmentExpression']['Indexes'].length).to.be(58);

    });

});
