/// <reference path="../src/typings/tsd.d.ts" />


/**
 * TestResults - Keeps values from Tests execution
 */
export default class TestResults {
    
    /**
     * Fit value 
     * Can be median or mean. Depends on configuration
     */
    fit: number;
    
    /**
     * Minimum observed from rounds executed 
     */
    min: number;
    
    /**
     * Maximum observed from rounds executed
     */
    max: number;
    
    /**
     * Mean observed from rounds executed
     */
    mean: number;
    
    /**
     * Median observed from rounds executed
     */
    median: number;
    
    /**
     * Total duration from rounds executed
     */
    duration: number;
    
    /**
     * Total rounds executeds
     */
    rounds: number;
    
    /**
     * List of all outputs from npm test command
     */
    outputs: string[] = [];
    
    /**
     * Determines the global results
     */
    passedAllTests: boolean;
    
    
    /**
     * 
     */
    constructor() {
        
    }
    
    
}