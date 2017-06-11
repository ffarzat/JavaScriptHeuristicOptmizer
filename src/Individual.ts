/// <reference path="../src/typings/tsd.d.ts" />
var escodegen = require('escodegen');

import traverse = require('traverse');
import TestResults from './TestResults';
import fs = require('fs');
var tmp = require('temporary');
//var snappy = require('snappy');

/**
* Individual - Represents an Individual Code over Improvement process
*/
export default class Individual {

    /**
     * Keeps all tree for this individual
     */
    //_astFile: any; //= new tmp.File();
    //_astFile: any = new tmp.File();

    astObj:any;

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

    typesRemoved: string[] = [];


    /**
     * Get parsed AST object
     *  */
    get AST(): any {
        //console.log(`AST GET: ${this._astFile.path}`);
        //return JSON.parse(fs.readFileSync(this._astFile.path).toString());
        //return JSON.parse(snappy.uncompressSync(this._astFile, { asBuffer: false }));
        return this.astObj;
    }
    /**
     * Store string representation of the AST object
     */
    set AST(value: any) {
        //console.log(`AST SET: ${this._astFile.path}`);
        //fs.writeFileSync(this._astFile.path, JSON.stringify(value), { flag: 'w' });
        //this._astFile = snappy.compressSync(JSON.stringify(value));
        this.astObj = value;
    }

    /**
     * Keeps the results from Tests 
     */
    testResults: TestResults;

    /**
     * Generates the Source Code based on this.AST
     */
    ToCode(): string {

        var code: string = "";

        try {
            //console.log(`AST: ${this.AST}`);
            var generatedAST = this.AST;
            code = escodegen.generate(generatedAST, this.Options);
            

            code = code.replace('return /******/\n', 'return /******/ '); //Patch for Esprima
        } catch (error) {
            //console.error('Error regenerating code: ' + error);
        }

        return code;
    }

    /**
     * Clones this individual instance
     */
    Clone(): Individual {
        var newOne = new Individual();
        newOne.typesRemoved = this.typesRemoved.slice();
        newOne.AST =   traverse(this.AST).clone();
        newOne.testResults = traverse(this.testResults).clone();
        return newOne;
    }
}
