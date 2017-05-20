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
     * Define se o HC deve reiniciar o processamento ao final, quando sobra orçamento
     */
    restartAtEnd: boolean;

    /**
     * Define se o HC deve reiniciar o processamento de forma aleatória, ou seja, escolhe qualquer tipo de instrução e e continua
     */
    ramdonRestart: boolean;
  
    /**
     * How many neighbors resolve at once
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
     * "FunctionDeclaration","FunctionExpression", "BlockStatement", "ObjectExpression","ArrayExpression",
     * "ExpressionStatement", "IfStatement","MemberExpression","BinaryExpression","CallExpression",
     * "ThisExpression","VariableDeclarator","Property","Identifier","Literal","ReturnStatement"
     * 
     */
    nodesType: string [];

    /**
     * Define se o HC deve embaralhar os tipos de instrução. Isso altera a maneira como ele processa os vizinhos em casa execução.
     */
    ramdonNodes: boolean;
    
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