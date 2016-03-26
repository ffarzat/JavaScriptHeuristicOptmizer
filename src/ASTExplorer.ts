 import esprima = require('esprima');
 import Individual from './Individual';
 import OperatorContext from './OperatorContext';
 
 
 /**
 * ASTExplorer
 */
export default class ASTExplorer {

/**
 * Esprima Global Parser options 
 */
    globalOptions: esprima.Options ={
        "loc": true,
        "range": true,
        "raw":true,
        "tokens":true,
        "comment": true,
        "attachComment": true,
        "tolerant": false,
        "source": true
    }
    
     /**
     * Generates the AST for especified code
     */
    Generate(file:string): Individual {
        var generatedAST = esprima.parse(file, this.globalOptions);
        var newIndividual: Individual = new Individual();
        newIndividual.AST = generatedAST;
        
        return  newIndividual;
    }
    
    /**
     * Executes the single point CrossOver
     */
    CrossOver(context: OperatorContext): Individual{
        return ;
    }
    
    /**
     * Executes a mutation over the AST
     */
    Mutate(context: OperatorContext): Individual{
        return ;
    }
    
}