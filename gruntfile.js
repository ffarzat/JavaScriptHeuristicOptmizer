module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-remove');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        remove: {
            options: {
                trace: true
            },
            dirList: ['build']
        }
    });


    grunt.registerTask('default', ['remove'], function () {
        var rmdir = require('rmdir');
        var path = require('path');
        var done = this.async();
        var buildPath = path.join(process.cwd(), "build");

        rmdir(buildPath, function (err, dirs, files) {
            grunt.log.writeln(`Removing: ${dirs}`);
            grunt.log.writeln(`Removing: ${files}`);
            done();
        });
    });
}