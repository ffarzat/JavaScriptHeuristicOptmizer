import IOutWriter from '../IOutWriter';
import IConfiguration from '../IConfiguration';
import TestResults from '../TestResults';
import Individual from '../Individual';
import TrialResults from './TrialResults';

import fs = require('fs');
import path = require('path');

var csvWriter = require('csv-write-stream')


/**
 * CsvResultsOutWritter
 */
export default class CsvResultsOutWriter implements IOutWriter {
    
    writer: any;
    
    directory: string;
    file: string;
    
    options = {
        separator: '|',
        newline: '\n',
        headers: ["trial", "originalIndividualAvgTime", "originalIndividualLOC", "originalIndividualCharacters", "bestIndividualAvgTime", "bestIndividualLOC", "bestIndividualCharacters"],
        sendHeaders: true
    }
    
    /**
     * Initializes the storage and instances
     *  */    
    Initialize(configuration: IConfiguration){
        this.DoClean(configuration);
        
        this.directory = configuration.resultsDirectory;
        this.file = path.join(configuration.resultsDirectory, configuration.trialResultsFile);
        
        //console.log('           csv:', this.file);
                        
        this.writer = csvWriter(this.options);
        this.writer.pipe(fs.createWriteStream(this.file));
    }
    
    /**
     * Clean or not old files
     */
    private DoClean(configuration: IConfiguration){
        
        if(fs.existsSync(configuration.resultsDirectory) && configuration.logFileClearing)
        {
            fs.unlinkSync(configuration.resultsDirectory);
        }
        
        fs.mkdir(configuration.resultsDirectory);
    }
    
    /**
     * Adds to storage a trial final result
     * 
     * Keeps Best code over directory with #TrialNumber.Js
     * 
     */
    WriteTrialResults(result: TrialResults){
        
        this.writer.write({
            "trial": result.trial, 
            "originalIndividualAvgTime": result.originalIndividualAvgTime, 
            "originalIndividualLOC" : result.originalIndividualLOC, 
            "originalIndividualCharacters" : result.originalIndividualCharacters,
            "bestIndividualAvgTime": result.bestIndividualAvgTime,
            "bestIndividualLOC": result.bestIndividualLOC,
            "bestIndividualCharacters": result.bestIndividualCharacters
        });       
    }
    
    /**
     * Ends the stream
     */
    Finish(){
        this.writer.end();
    }
   
}