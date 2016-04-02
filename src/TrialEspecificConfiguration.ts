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
     * Commands to HC restart every N avaliations unsuccessful
     * 
     */
    restart: boolean;
    
    /**
     * How many avaliations before restart
     */
    trialsToRestart: number;
    
    
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