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
    Generate(code:string): ESTree.Program {
        return  esprima.parse('var oi = "teste";', this.globalOptions);
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