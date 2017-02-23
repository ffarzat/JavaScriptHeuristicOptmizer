/// <reference path="../src/typings/tsd.d.ts" />
/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ASTExplorer from '../src/ASTExplorer';
import Individual from '../src/Individual';
import Optmizer from '../src/Optmizer';


describe('Optmizer Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes



    /*
        it('Should Run Setup from configuration ', () => {
            var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
            var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
    
            configuration.libraries.splice(0, 1); //removing underscore from this test
    
            var optmizer = new Optmizer();
            optmizer.Setup(configuration, 0, 0);
            expect(optmizer.trialIndex).to.be(0);
            optmizer.DoOptmization(0, () => {
                expect(optmizer.trialIndex).to.be(0);
    
                optmizer.Setup(configuration, 1, 0);
                expect(optmizer.trialIndex).to.be(1);
                optmizer.DoOptmization(0,() => {
                    expect(optmizer.trialIndex).to.be(1);
                });
    
            });
        });
    */


});
