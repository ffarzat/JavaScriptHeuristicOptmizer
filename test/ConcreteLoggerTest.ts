/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import ConcreteLogger from '../src/ConcreteLogger';
import ILogger from '../src/ILogger';


describe('ConcreteLogger Tests', () => {
  
    it('Should Write a Log message from configuration parameters ', () => {
        
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        var concrete: ILogger = new ConcreteLogger();        
        concrete.Initialize(configuration);
        concrete.Write("Just a test from unit testing");
        concrete.Finish();
        
        expect(fs.existsSync(concrete.File())).to.be(true);        
    });
    
});
