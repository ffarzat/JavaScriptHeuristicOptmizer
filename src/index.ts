/**
 * Starts the Improvment Process based on cofigFile [Configuration.Json]
 */
import IConfiguration from './IConfiguration';
import Optmizer from './Optmizer';


import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');

//reads config
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

//Just prepare all libs
for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
    var element = configuration.libraries[libIndex];
    
    var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec(`cd ${element.path} && npm install`, {silent:true}) as Shell.ExecOutputReturnValue);
    if(returnedOutput.code > 0){
        console.log(`Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
        configuration.libraries.splice(libIndex, 1);
    }
    console.log(`Library ${element.name} instaled successfully`);
}

//for all trials
var optmizer = new Optmizer();

for (var trial = 0; trial < configuration.trials; trial++) {
    for (var heuristicTrial = 0; heuristicTrial < configuration.trialsConfiguration.length ; heuristicTrial++) {
        var optmizer = new Optmizer();
        optmizer.Setup(configuration, trial, heuristicTrial);
        optmizer.DoOptmization();    
    }
}