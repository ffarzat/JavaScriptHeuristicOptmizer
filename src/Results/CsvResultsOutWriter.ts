import IOutWriter from '../IOutWriter';
import IConfiguration from '../IConfiguration';
import TestResults from '../TestResults';
import Individual from '../Individual';
import Library from '../Library';
import TrialResults from './TrialResults';
import IHeuristic from '../heuristics/IHeuristic';

import fs = require('fs');
import path = require('path');


/**
 * CsvResultsOutWritter
 */
export default class CsvResultsOutWriter implements IOutWriter {
    
    csvcontent: string;
    
    directory: string;
    file: string;
    
    configuration: IConfiguration;
    
    library: Library;
    heuristic: IHeuristic;
    
    newLine: string = '\n';
    
    /**
     * Initializes the storage and instances
     *  */    
    Initialize(configuration: IConfiguration, library: Library, heuristic: IHeuristic){
        this.heuristic = heuristic;
        this.library = library;
        this.configuration = configuration;
        
        this.directory = path.join(configuration.resultsDirectory, this.library.name, this.heuristic.Name);
        this.file = path.join(this.directory, configuration.trialResultsFile);
        
        this.MkDirs();
        this.MkFiles();
    }
    
    /**
     * Creates initial files
     */
    private MkFiles(){
        if(!fs.existsSync(this.file))
        {
            this.csvcontent = "sep=," + this.newLine;
            this.csvcontent += "trial,originalIndividualAvgTime,originalIndividualLOC,originalIndividualCharacters,bestIndividualAvgTime,bestIndividualLOC,bestIndividualCharacters" + this.newLine;
            fs.writeFileSync(this.file, this.csvcontent);
        }
    }
    
    /**
     * Creates directories for run
     */
    private MkDirs(){
        //Results root folder
        if(!fs.existsSync(this.configuration.resultsDirectory))
        {
            fs.mkdirSync(this.configuration.resultsDirectory);    
        }
        
        var libFolder = path.join(this.configuration.resultsDirectory, this.library.name);
        if(!fs.existsSync(libFolder))
        {
            fs.mkdirSync(libFolder);    
        }
        
        var heuristicFolder = path.join(this.configuration.resultsDirectory, this.library.name, this.heuristic.Name);
        if(!fs.existsSync(heuristicFolder))
        {
            fs.mkdirSync(heuristicFolder);    
        }
        
    }
    
    /**
     * Adds to storage a trial final result
     * 
     * Keeps Best code over directory with #TrialNumber.js
     * 
     */
    WriteTrialResults(result: TrialResults){

        fs.appendFileSync(this.file, result.trial + "," + 
                    result.originalIndividualAvgTime + "," + 
                    result.originalIndividualLOC + "," +
                    result.originalIndividualCharacters + "," + 
                    result.bestIndividualAvgTime + "," + 
                    result.bestIndividualLOC + "," + 
                    result.bestIndividualCharacters + 
                    this.newLine
        );
        this.WriteCodeToFile(result);
    }
    
    /**
     * Writes the new code Over old Main File of the lib over tests
     */
    private WriteCodeToFile(result: TrialResults) {
        var bestCodeFile = path.join(this.directory, result.trial + ".js");
        fs.writeFileSync(bestCodeFile, result.best.ToCode());
        
        var originalCodeFile = path.join(this.directory, "original.js");
        if(!fs.existsSync(originalCodeFile))
        {
            fs.writeFileSync(originalCodeFile, result.best.ToCode());    
        }
    }
    
    /**
     * Ends the stream
     */
    Finish(){

    }
   
}