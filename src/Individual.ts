/// <reference path="../src/typings/tsd.d.ts" />
var escodegen = require('escodegen');
import esprima = require('esprima');

 /**
 * Individual - Represents an Individual Code over Improvement process
 */
export default class Individual {

    /**
     * Keeps all tree for this individual
     */
    AST: any;

    /**
     * Options to generate new code
     * https://github.com/estools/escodegen/wiki/API
     */
     Options: any = {
         comment: true,
         format: {
             indent: {
                 style: '    '
             },
             quotes: 'auto'
         }
     };
        
    /**
     * Generates the Source Code based on this.AST
     */
    ToCode() :string{

        var generatedAST = escodegen.attachComments(this.AST, this.AST.comments, this.AST.tokens);

        return escodegen.generate(generatedAST, this.Options);
    }
}
