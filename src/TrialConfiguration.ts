/// <reference path="../src/typings/tsd.d.ts" />

/**
 * TrialConfiguration - Trial Global configuration
 */
export default class TrialConfiguration {
    
    /**
     * Neighbor approach for HC 
     * 
     * By now can be:
     * [FirstAscent, LastAscent]
     */
    neighborApproach: string;
    
    /**
     * Commands to HC restart every N avaliations unsuccessful
     * 
     */
    restart:boolean;
    
    /**
     * How many avaliations before restart
     */
    trialsToRestart:number;
}