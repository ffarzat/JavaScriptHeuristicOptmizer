module.exports = function (grunt) {
    grunt.task.registerTask('qtest', 'run tests locally', function () {
        var done = this.async();

        var testrunner = require('qunit');

        testrunner.options.log.assertions = true;
        testrunner.options.log.tests = true;
        testrunner.options.log.summary = true;
        testrunner.options.log.testing = true;
        testrunner.options.log.errors = true,
        testrunner.options.maxBlockDuration = 7200000;

        var tests;

        if (grunt.option('only') != null) {
            tests = grunt.file.expand.apply(null, grunt.option('only').split(',').map(function (file) {
                if (file === 'moment') {
                    return 'build/umd/test/moment/*.js';
                } else if (file === 'locale') {
                    return 'build/umd/test/locale/*.js';
                } else {
                    return 'build/umd/test/' + file + '.js';
                }
            }));
        } else {
            tests = grunt.file.expand('build/umd/test/moment/*.js',
                'build/umd/test/locale/*.js');
        }

        testrunner.run({
            code: 'build/umd/moment.js',
            tests: tests
        }, function (err, report) {
            if (err) {
                console.log('woot', err, report);
                done(err);
                return;
            }
            err = null;
            if (report.failed !== 0) {
                err = new Error(report.failed + ' tests failed');
            }
            done(err);
        });
    });
};
