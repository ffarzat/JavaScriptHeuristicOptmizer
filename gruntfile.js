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
        var rmdir           = require('rmdir');
        var fse              = require('fs-extra');
        var path            = require('path');
        var done            = this.async();
        var buildPath       = path.join(process.cwd(), "build");
        var clientPath      = path.join(process.cwd(), "client");

        rmdir(buildPath, function (err, dirs, files) {
            //grunt.log.writeln(`Removing: ${dirs}`);
            //grunt.log.writeln(`Removing: ${files}`);
            
            //Deploy client folder
            fse.copySync(clientPath, path.join(buildPath, 'client'), {"clobber": true});
            
            done();
        });
        
        
        
    });
}