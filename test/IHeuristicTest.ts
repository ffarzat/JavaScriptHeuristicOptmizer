/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';

import IHeuristic from '../src/heuristics/IHeuristic';
import HeuristicFactory from '../src/heuristics/HeuristicFactory';
import GA from '../src/heuristics/GA';
import RD from '../src/heuristics/RD';
import HC from '../src/heuristics/HC';
import LogFactory from '../src/LogFactory';

describe('IHeuristic Tests', function() {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should Validate Configuration ', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var rdInstance = new HeuristicFactory().CreateByName(configuration.heuristics[1]);
        var especific = configuration.trialsConfiguration[0].especific;

        rdInstance.Setup(especific, configuration, undefined);

        expect(rdInstance).not.be.an('undefined');
        expect(rdInstance._config).not.be.an('undefined');
    });

    it('Should Validate Especific Configuration ', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        //console.log(`Creating an instance of ${configuration.heuristics[2]}`);
        var hcInstance: HC = new HeuristicFactory().CreateByName(configuration.heuristics[2]) as HC;
        var especific = configuration.trialsConfiguration[0].especific;
        hcInstance.Setup(especific, configuration, undefined);
        //console.log(JSON.stringify(hcInstance));

        expect(hcInstance).not.be.an('undefined');
        expect(hcInstance.neighborApproach).to.be("LastAscent");
    });

    it('Should Creates Concretes Heuristics from configuration ', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        expect(configuration.heuristics[0]).to.be('GA');

        var ga = new HeuristicFactory().CreateByName(configuration.heuristics[0]);
        expect(ga).not.be.an('undefined');
    });

    it('Should Make static count of functons ', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var ga = new HeuristicFactory().CreateByName(configuration.heuristics[0]);
        var astExplorer: ASTExplorer = new ASTExplorer();
        var lib = configuration.libraries[5];
        var libFile: string = lib.mainFilePath;
        var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);
        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);

        ga.Original = generatedIndividual.Clone();
        ga._logger = logger;
        var dic = ga.getFunctionStaticList();

        expect(ga).not.be.an('undefined');
        //fs.writeFileSync(`Libraries/${lib.name}/${lib.name}-resultados-estatico.json`, JSON.stringify(dic, null, 4));

    });

});