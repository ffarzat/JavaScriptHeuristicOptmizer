/**
 * TrialEspecificConfiguration
 */
export default class TrialEspecificConfiguration {
   
   
   //================================================================================================ HC =>
   /**
     * Neighbor approach for HC 
     * 
     * By now can be:
     * [FirstAscent, LastAscent]
     */
    neighborApproach: string;
    
    /**
     * To async resolve
     */
    neighborsToProcess: number;
    
    /**
     * Budget for HC running
     *  */    
    trials: number;
    
    /**
     * List of Esprima nodes Type for select inside every Heuristic
     * 
     * By now can be:
     * 
     * [CallExpression, IfStatement]
     * 
     */
    nodesType: string [];
    
    //================================================================================================ GA =>

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