/// <reference path="../../src/typings/tsd.d.ts" />
import expect = require('expect.js');

import IConfiguration from '../../src/IConfiguration';
import GA from '../../src/heuristics/GA';


describe('GA Tests', () => {
    
    it('Setup should be false', () => {
        var ga: GA = new GA();
        
        expect(ga).not.be.a('undefined');
        
    });
    
})