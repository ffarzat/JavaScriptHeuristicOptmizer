/// <reference path="../src/typings/tsd.d.ts" />
var escodegen = require('escodegen');

import traverse = require('traverse');
import TestResults from './TestResults';
import fs = require('fs');
var tmp = require('temporary');

 /**
 * Individual - Represents an Individual Code over Improvement process
 */
export default class Individual {

    /**
     * Keeps all tree for this individual
     */
    private _astFile: string = new tmp.File().path;

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
     * Get parsed AST object
     *  */   
    get AST():any {
        return JSON.parse(fs.readFileSync(this._astFile).toString());
    }
    /**
     * Store string representation of the AST object
     */
    set AST(value:any) {
        fs.writeFileSync(this._astFile, JSON.stringify(value), { flag : 'w' });
    }
       
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
            //console.error('Error regenerating code: ' + error);
        }

        return code; 
    }
    
    /**
     * Clones this individual instance
     */
    Clone(): Individual
    {
        var newOne = new Individual(); //new file
        newOne.AST = this.AST;//traverse(JSON.parse(this.AST)).clone();
        
        return newOne;
    }
}
