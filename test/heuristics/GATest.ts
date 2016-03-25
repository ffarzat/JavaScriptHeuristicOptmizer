/// <reference path="../../src/typings/tsd.d.ts" />
import expect = require('expect.js');

import Configuration from '../../src/Configuration';
import GA from '../../src/heuristics/GA';


describe('GA Tests', () => {
    
    it('Setup should be false', () => {
        var ga: GA = new GA();
        
        expect(ga.setup(new Configuration())).to.be.a('undefined');
        
    });
    
})