/// <reference path="../src/typings/tsd.d.ts" />
var escodegen = require('escodegen');
var deepcopy = require("deepcopy");

import TestResults from './TestResults';

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
      * Keeps the results from Tests 
      */   
     testResults: TestResults;   
        
    /**
     * Generates the Source Code based on this.AST
     */
    ToCode() :string{

        var code: string = "";
        
        try {
            //var generatedAST = escodegen.attachComments(this.AST, this.AST.comments, this.AST.tokens);
            var generatedAST = this.AST;
            code = escodegen.generate(generatedAST, this.Options);     
        } catch (error) {
            console.error(error);
        }

        return code; 
    }
    
    /**
     * Clones this individual instance
     */
    Clone(): Individual
    {
        var newOne = new Individual();
        newOne.AST = deepcopy(this.AST);
        
        return newOne;
    }
}
