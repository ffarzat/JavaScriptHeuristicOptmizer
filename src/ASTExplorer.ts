import esprima = require('esprima');
import fs = require('fs');
import Individual from './Individual';
import OperatorContext from './OperatorContext';

import path = require('path');

var estraverse = require("estraverse");
var deepcopy = require("deepcopy");
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
        var totalNodes: number = 0;
        
        estraverse.traverse(individual.AST, {
            enter: function (node) {
                totalNodes++;
            }
        });

        return totalNodes;
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
        var counter = 0;

        try {
            estraverse.replace(individual.AST, {
                    enter: function (node) {
                        if (counter == nodeIndex) {
                            return nodeReplacement;
                        }
                        
                        counter++;
                    }
                });
        } catch (error) {
            console.log('Error due Crossover operator');
        }
        
        return newOne;
    }

    /**
     * Retrivies a node by index
     */
    private GetNode(individual: Individual, nodeIndex: number): any {
        var counter = 0;
        var nodeOverIndex: any = {};

        estraverse.traverse(individual.AST, {
            enter: function (node) {
                if (counter == nodeIndex) {
                    nodeOverIndex = deepcopy(node);
                    this.break();
                }
                counter++;
            }
        });

        return nodeOverIndex;
    }

    /**
     * Executes a mutation over the AST
     */
    Mutate(context: OperatorContext): Individual {

        var mutant = context.First.Clone();
        var counter = 0;
        var randonNodeToPrune: number = this.GenereateRandom(0, context.TotalNodesCount);

        this.ReplaceNode(mutant, randonNodeToPrune, {"type": "EmptyStatement"});

        return mutant;
    }

    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    private GenereateRandom(low, high): number {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

}