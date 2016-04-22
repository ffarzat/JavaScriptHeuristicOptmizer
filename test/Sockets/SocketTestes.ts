/// <reference path="../../src/typings/tsd.d.ts" />

import IConfiguration from '../../src/IConfiguration';
import Server from '../../src/Sockets/Server';

import fs = require('fs');
import path = require('path');
import expect = require('expect.js');

describe('Socket Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should Server and Client talk', function () {
        
        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        
        var testServer = new Server();
        testServer.Setup(configuration);
        
    });
});