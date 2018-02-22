'use strict';

const chai = require('chai');

const expect = chai.expect;

const timer = require('../index').timer;

const FakeTick = function (diffToReturn) {
    this.getDiff = function () {
        return diffToReturn;
    };
};

const getTimerWithTicks = function (name, diffs) {
    const testTimer = timer(name);

    for (let i = 0, len = diffs.length; i < len; i++) {
        testTimer.ticks.push(new FakeTick(diffs[i]));
    }

    return testTimer;
};

describe('BDD', function () {

    describe('Helpers', function () {
        describe('median', function () {
            it('should calculate the median correctly for a timer containing 6 tick not ordered', function () {
                const medianTestTimerWith6Ticks = getTimerWithTicks('medianTestTimerWith6Ticks', [4, 1, 10, 9, 6, 7]); //1, 4, 6, 7, 9, 10

                expect(medianTestTimerWith6Ticks.median()).to.equal(6.5);
            });

        });

        describe('mean', function () {
            it('should calculate the mean correctly for a timer containing 6 tick not ordered', function () {
                const meanTestTimerWith6Ticks = getTimerWithTicks('meanTestTimerWith6Ticks', [4, 1, 10, 9, 6, 7]); //1, 4, 6, 7, 9, 10

                expect(meanTestTimerWith6Ticks.mean()).to.equal(6.166666666666667);
            });

        });
    });
});