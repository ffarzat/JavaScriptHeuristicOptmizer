/// <reference path="../src/typings/tsd.d.ts" />

import TrialEspecificConfiguration from './TrialEspecificConfiguration';

/**
 * TrialConfiguration - Respresents Trial Global configuration for each Heuristic
 */
export default class TrialConfiguration {
    
    /**
     * Determines how optmization process will proceed over scope
     * 
     * By now can be:
     * 
     * [Global, NodeType]
     * 
     */
    nodesSelectionApproach: string;
    
    /**
     * List of Esprima nodes Type for select inside every Heuristic
     * 
     * By now can be:
     * 
     * [Function]
     * 
     */
    nodesType: string [];
    
    /**
     * Especific details for heurisitics runs
     */
    especific: TrialEspecificConfiguration;
}