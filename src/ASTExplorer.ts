import esprima = require('esprima');
import fs = require('fs');
import Individual from './Individual';
import OperatorContext from './OperatorContext';

import path = require('path');
import traverse = require('traverse');

var estraverse = require("estraverse");
var escodegen = require('escodegen');

/**
* ASTExplorer
*/
export default class ASTExplorer {

    /**
     * Esprima Global Parser options 
     */
    globalOptions: esprima.Options = { raw: true, tokens: true, range: true, loc: true, comment: true };

    /**
    * Generates the AST for especified code
    */
    GenerateFromFile(file: string): Individual {

        var sourceCode: string = fs.readFileSync(file, 'utf8');
        var generatedAST = esprima.parse(sourceCode, this.globalOptions) as any;

        var newIndividual: Individual = new Individual();
        
        var generatedAST = escodegen.attachComments(generatedAST, generatedAST.comments, generatedAST.tokens);
        
        newIndividual.AST = generatedAST;

        return newIndividual;
    }

    /**
     * Count the total number of nodes inside an AST
     */
    CountNodes(individual: Individual): number {
        return traverse(individual.AST).nodes().length;
    }

    /**
     * Executes the single point CrossOver
     */
    CrossOver(context: OperatorContext): Individual[] {
        var randomIndexNodeOne: number = this.GenereateRandom(0, context.TotalNodesCount);
        var randomIndexNodeTwo: number = this.GenereateRandom(0, context.TotalNodesCount);

        //Gets the nodes
        var firstNode = this.GetNode(context.First, randomIndexNodeOne);
        var secondNode = this.GetNode(context.Second, randomIndexNodeTwo);

        //Do Crossover
        var newSon: Individual = this.ReplaceNode(context.Second, randomIndexNodeTwo, firstNode);
        var newDaughter: Individual = this.ReplaceNode(context.First, randomIndexNodeOne, secondNode);
        
        //If err in cross...
        try {
            newSon.ToCode();
        } catch (error) {
            newSon = undefined;
        }
        
        try {
            newDaughter.ToCode();
        } catch (error) {
            newDaughter = undefined;
        }


        var result: Individual[] = [newSon, newDaughter];

        return result;
    }

    /**
     * Replaces a node by index returning a brand new Individual
     */
    private ReplaceNode(individual: Individual, nodeIndex: number, nodeReplacement: any): Individual {
        var newOne = individual.Clone();
        var counter=0;
        traverse(newOne.AST).forEach( function (x) {
            if(counter == nodeIndex){
                this.update(nodeReplacement, true);
            }
            counter++;
        });
     
        return 
        
    }

    /**
     * Retrivies a node by index
     */
    private GetNode(individual: Individual, nodeIndex: number): any {
        return traverse(individual.AST).nodes()[nodeIndex];
    }

    /**
     * Executes a mutation over the AST
     */
    Mutate(context: OperatorContext): Individual {
       var mutant: Individual;
       var originalCode = context.First.ToCode();
       
       for (var index = 0; index < 100; index++) { //todo: adds top limit to mutation tries in config.json or ctx
           //console.log(`Mutation trial ${index}`)
           mutant = this.TryMutate(context);
           var mutantCode = mutant.ToCode();
           
           if(mutantCode != "" && mutantCode != originalCode){
               break;    
           }
       }
       
        return mutant;
    }
    
    /**
     * Try to mutate an individual
     */
    private TryMutate(context: OperatorContext): Individual {
        var mutant = context.First.Clone();
        var indexes: number [] = this.IndexNodes(mutant);
        var counter = 0;
        var randonNodeToPrune: number = this.GenereateRandom(0, indexes.length);

        //console.log(`rd node to remove ${randonNodeToPrune} of ${indexes.length}`);

        mutant.AST = traverse(mutant.AST).map(function (node) {
            if(counter == indexes[randonNodeToPrune]){
                this.remove(true);
            }

            counter++;
        });

        return mutant;
    }

    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    private GenereateRandom(low, high): number {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }
    
    /**
     * 
     */
    IndexNodes(individual: Individual): number [] {
        var nodes = traverse(individual.AST).nodes();
        var nodesIndex: number [] = [];
        var index: number = 0;
        
        traverse(individual.AST).forEach(function (node) {
            if(node && node.type && (node.type != 'Line' || node.type != 'Block' )){ //comments - Line and Block
                //console.log('Indice: ' + index);
                //console.log('Tipo ' + node.type);
                nodesIndex.push(index);
            }
            
            index++;
        });
        
        return nodesIndex;
    }    
    
}