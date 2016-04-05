import esprima = require('esprima');
import fs = require('fs');
import Individual from './Individual';
import OperatorContext from './OperatorContext';

import path = require('path');

var types = require("ast-types");
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
        types.visit(individual.AST, {
            //This method will visit every node on AST            
            visitNode: function(path) {

                var node = path.node;
                totalNodes++;

                this.traverse(path); //continue
            }
        });

        return totalNodes;
    }


    /**
     * Executes the single point CrossOver
     */
    CrossOver(context: OperatorContext): Individual[] {
        var randomIndexNode: number = this.GenereateRandom(0, context.TotalNodesCount);

        //Gets the nodes
        var firstNode = this.GetNode(context.First, randomIndexNode);
        var secondNode = this.GetNode(context.Second, randomIndexNode);

        //Do Crossover
        var newSon: Individual = this.ReplaceNode(context.Second, randomIndexNode, firstNode);
        var newDaughter: Individual = this.ReplaceNode(context.First, randomIndexNode, secondNode);

        var result: Individual[] = [newSon, newDaughter];

        return result;
    }

    /**
     * Replaces a node by index returning a brand new Individual
     */
    private ReplaceNode(individual: Individual, nodeIndex: number, nodeReplacement: any): Individual {
        var newOne = individual.Clone();
        var counter = 0;

        types.visit(newOne.AST, {
            visitNode: function(path) {
                var node = path.node;
                if (counter == nodeIndex) {
                    path.replace(nodeReplacement);
                    this.abort();
                }

                counter++;
                this.traverse(path); //continue
            }
        });

        return newOne;
    }

    /**
     * Retrivies a node by index
     */
    private GetNode(individual: Individual, nodeIndex: number): any {
        var counter = 0;
        var nodeOverIndex: any = {};

        types.visit(individual.AST, {
            visitNode: function(path) {
                var node = path.node;
                if (counter == nodeIndex) {
                    nodeOverIndex = deepcopy(node);
                    this.abort();
                }

                counter++;
                this.traverse(path); //continue
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

        types.visit(mutant.AST, {
            //This method will visit every node on AST            
            visitNode: function(path) {

                var node = path.node;

                if (counter == randonNodeToPrune) {
                    var nodeExcluded = path.prune();
                    this.abort();
                    //console.log(JSON.stringify(nodeExcluded.node));
                    //TODO: keeps the excluded node for reports
                }

                counter++;
                this.traverse(path); //continue
            }
        });

        return mutant;
    }

    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    private GenereateRandom(low, high): number {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

}