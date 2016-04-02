/// <reference path="../src/typings/tsd.d.ts" />

/**
 * TrialConfiguration - Respresents Trial Global configuration for each Heuristic
 */
export default class TrialConfiguration {
    
    /**
     * Determines how optmization process will proceed over scope
     * 
     * By now can be:
     * 
     * [global, NodeType]
     * 
     */
    nodesSelectionApproach: string;
    
    /**
     * List of Esprima nodes Type for select inside every Heuristic
     * 
     * By now can be:
     * 
     * [CallExpression, IfStatement]
     * 
     */
    nodesType: string [];
    
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
    restart: boolean;
    
    /**
     * How many avaliations before restart
     */
    trialsToRestart: number;
    
    /**
     * GA #generations
     */
    generations: number;
    
    /**
     * GA #individuals
     */
    individuals: number;
    
    /**
     * Crossover probability 
     */
    crossoverProbability: number;
    
    /**
     * Mutation probability 
     */
    mutationProbability: number;
    
    /**
     * Use or not Elitism
     */
    elitism: boolean;
    
    /**
     * % of individuals for elitism
     *  */    
    elitismPercentual: number;
}