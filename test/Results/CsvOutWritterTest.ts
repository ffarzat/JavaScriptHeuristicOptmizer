/// <reference path="../../src/typings/tsd.d.ts" />
import expect = require('expect.js');

import fs = require('fs');
import path = require('path');

import IConfiguration from '../../src/IConfiguration';
import CsvResultsOutWriter from '../../src/Results/CsvResultsOutWriter';
import IOutWriter from '../../src/IOutWriter';
import IOutWriterFactory from '../../src/IOutWriterFactory';

describe('CsvOutWritterTest Tests', () => {
    
    it('Setup write results', () => {
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

        var concrete = new IOutWriterFactory().CreateByName(configuration.outWriter);
        concrete.Initialize(configuration);
        
        expect(concrete).not.be.an('undefined');       
    });
    
})