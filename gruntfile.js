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
    
    
    grunt.registerTask('default', ['remove'], function (){
        var rmdir = require('rmdir');
        var done = this.async();
        grunt.log.writeln(`Removing: ${process.cwd() + "\\build\\"}`);
        
        rmdir(process.cwd() + "/build/", function (err, dirs, files) {
            //console.log(dirs);
            //console.log(files);
            //console.log('all files are removed');
            grunt.log.writeln(`done`);
            done();
        });
    });
}