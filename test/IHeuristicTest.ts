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

describe('IHeuristic Tests', () => {

    it('Should Validate Configuration ', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var rdInstance = new HeuristicFactory().CreateByName(configuration.heuristics[1]);
        
        rdInstance.Setup(configuration);
        
        expect(rdInstance).not.be.an('undefined');
        expect(rdInstance._config).not.be.an('undefined');
        expect(rdInstance._logger).not.be.an('undefined');
        expect(rdInstance._tester).not.be.an('undefined');
    });
    
    it('Should Creates Concretes Heuristics from configuration ', () => {
        
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        expect(configuration.heuristics[0]).to.be('GA');
                
        var ga = new HeuristicFactory().CreateByName(configuration.heuristics[0]);
        expect(ga).not.be.an('undefined');       
    });
    
});