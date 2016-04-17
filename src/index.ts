/**
 * Starts the Improvment Process based on cofigFile [Configuration.Json]
 */
import IConfiguration from './IConfiguration';
import Optmizer from './Optmizer';


import fs = require('fs');
import path = require('path');

//reads config
var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

//for all trials
var optmizer = new Optmizer();

for (var trial = 0; trial < configuration.trials; trial++) {
    for (var heuristicTrial = 0; heuristicTrial < configuration.trialsConfiguration.length ; heuristicTrial++) {
        var optmizer = new Optmizer();
        optmizer.Setup(configuration, trial, heuristicTrial);
        optmizer.DoOptmization();    
    }
}