 import esprima = require('esprima');
 import fs = require('fs');
 import Individual from './Individual';
 import OperatorContext from './OperatorContext';
 
 
 /**
 * ASTExplorer
 */
export default class ASTExplorer {

/**
 * Esprima Global Parser options 
 */
    globalOptions: esprima.Options = {range: true, tokens: true, comment: true};
    
     /**
     * Generates the AST for especified code
     */
    Generate(file:string): Individual {
        
        var sourceCode: string = fs.readFileSync(file, 'utf8');
        var generatedAST = esprima.parse(sourceCode, this.globalOptions);
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