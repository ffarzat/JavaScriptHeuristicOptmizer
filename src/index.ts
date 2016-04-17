/**
 * Starts the Improvment Process based on cofigFile [Configuration.Json]
 */
import IConfiguration from './IConfiguration';
import Optmizer from './Optmizer';
import LogFactory from './LogFactory';


import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');

//=========================================================================================== Reads config
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
var testOldDirectory: string = process.cwd();

//=========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

logger.Write(`Initializing Optmizer for ${configuration.libraries.length} libraries`);
logger.Write(`Preparing libs environment`);

//=========================================================================================== Just prepare all libs
for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
    var element = configuration.libraries[libIndex];
    try {
        var libDirectoryPath = path.join(process.cwd(), element.path);
        process.chdir(libDirectoryPath);
        var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec(`npm install`, {silent:true}) as Shell.ExecOutputReturnValue);

        if(returnedOutput.code > 0){
            logger.Write(`Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
            configuration.libraries.splice(libIndex, 1);
        }
        else
        {
            logger.Write(`Library ${element.name} instaled successfully`);
        }
        
    } catch (error) {
        logger.Write(`${error}`);
    }
    finally{
            process.chdir(testOldDirectory);
    }
}

//=========================================================================================== For all trials
for (var trial = 0; trial < configuration.trials; trial++) {
    for (var heuristicTrial = 0; heuristicTrial < configuration.trialsConfiguration.length ; heuristicTrial++) {
        var optmizer = new Optmizer();
        optmizer.Setup(configuration, trial, heuristicTrial);
        optmizer.DoOptmization();    
    }
}