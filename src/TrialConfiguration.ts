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
     * [Global, ByFunction]
     * 
     */
    nodesSelectionApproach: string;
    
    /**
     * Determina se a execução por função é dinâmica ou estática
     * 
     * Isso modifica o comportamento da composição do Ranking e não da otimização em si
     */
    ByFunctionType: string;

    /**
     * List of Esprima nodes Type for select inside every Heuristic
     * 
     * By now can be:
     * 
     * [Global, ByFunction, DinamycFunction]
     *  
     */
    nodesType: string [];
    
    /**
     * Especific details for heurisitics runs
     */
    especific: TrialEspecificConfiguration;
}