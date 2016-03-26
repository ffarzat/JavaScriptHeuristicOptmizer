/// <reference path="../src/typings/tsd.d.ts" />
var escodegen = require('escodegen');

 /**
 * Individual - Represents an Individual Code over Improvement process
 */
export default class Individual {
    
    /**
     * Keeps all tree for this individual
     */
    AST: ESTree.Program;
    
    /**
     * Options to generate new code
     * https://github.com/estools/escodegen/wiki/API
     */
    Options: any =     { 
        comment: true
    };
    
    /**
     * Generates the Source Code based on this.AST
     * 
     */
    ToCode() :string{
        return escodegen.generate(this.AST, this.Options) ;
    }
}