/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';
import Optmizer from '../src/Optmizer';

describe('Optmizer Tests', function () {

    this.timeout(60*10*1000); //10 minutes

    it('Should Run Setup from configuration ', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var optmizer = new Optmizer();
        optmizer.Setup(configuration, 0);
        
        expect(optmizer.trialIndex).to.be(0);

    });  
    
});
