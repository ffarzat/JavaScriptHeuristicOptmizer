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
       var newSon: Individual;
       var newDaughter: Individual;
       var originalCode = context.First.ToCode();
       
       for (var index = 0; index < context.CrossOverTrials; index++) { //todo: adds top limit to mutation tries in config.json or ctx
           //console.log(`Crossover trial ${index}`)
           var news = this.TryCrossOver(context);
           
           newSon = news[0];
           newDaughter = news[1];
           
           if((newSon.ToCode() != "" && newSon.ToCode() != originalCode) && (newDaughter.ToCode() != "" && newDaughter.ToCode() != originalCode)){
               break;    
           }
       }
       
       if(!newSon || !newDaughter){ //no way to cross! Dammit!
           newSon = context.First.Clone();
           newDaughter = context.Second.Clone();
       } 
       

        return [newSon, newDaughter];
    }
    
    /**
     * Try to execute single point CrossOver operation
     */
    private TryCrossOver(context: OperatorContext): Individual[] {
        var indexesOne: number [] = this.IndexNodes(context.First);
        var indexesTwo: number [] = this.IndexNodes(context.Second);
        var randomIndexNodeOne: number = this.GenereateRandom(0, indexesOne.length);
        var randomIndexNodeTwo: number = this.GenereateRandom(0, indexesTwo.length);

        //Gets the nodes
        var firstNode = this.GetNode(context.First, indexesOne[randomIndexNodeOne]);
        var secondNode = this.GetNode(context.Second, indexesTwo[randomIndexNodeTwo]);
        
        //console.log('Node #1:' + JSON.stringify(firstNode));
        //console.log('Node #2:' + JSON.stringify(secondNode));

        //Do Crossover
        var newSon: Individual = this.ReplaceNode(context.Second, indexesTwo[randomIndexNodeTwo], firstNode);
        var newDaughter: Individual = this.ReplaceNode(context.First, indexesOne[randomIndexNodeOne], secondNode);
        
        //If err in cross...
        try {
            newSon.ToCode();
        } catch (error) {
            newSon = context.First.Clone();
        }
        
        try {
            newDaughter.ToCode();
        } catch (error) {
            newDaughter = context.Second.Clone();
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
                //console.log('Actual Node' + JSON.stringify(this.node));
                //console.log('Replacement Node' + JSON.stringify(nodeReplacement));
                this.update(nodeReplacement);
                this.stop();
                //console.log('New Node' + JSON.stringify(this.node));
                //this.remove(true);
            }
            counter++;
        });

        return  newOne;
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
       
       for (var index = 0; index < context.MutationTrials; index++) { //todo: adds top limit to mutation tries in config.json or ctx
           //console.log(`Mutation trial ${index}`)
           mutant = this.TryMutate(context);
           var mutantCode = mutant.ToCode();
           
           if(mutantCode != "" && mutantCode != originalCode){
               break;    
           }
       }
       
       if(!mutant){ //no way to mutate! Dammit!
           mutant = context.First.Clone();
       } 

        return mutant;
    }
    
    /**
     * Releases a mutation over an AST  by node index
     */
     MutateBy(context: OperatorContext): Individual{
        var mutant = context.First.Clone(); 
        var localNodeIndex = context.NodeIndex;
        var counter = 0;
        
        mutant.AST = traverse(mutant.AST).map(function (node) {
            if(counter == localNodeIndex){
               this.remove();
               this.stop();
            }
            //console.log(counter);
            counter++;
        });
        
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
                this.remove();
                this.stop();
            }
            counter++;
        });

        return mutant;
    }

    /**
     * Generates random integer between two numbers low (inclusive) and high (inclusive) ([low, high])  
     */
    GenereateRandom(low, high): number {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }
    
    /**
     * Creates a index map for all valid node types
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
    
    /**
     * Creates a index map for especific node types
     */
    IndexNodesBy(nodeType: string, individual: Individual): number [] {
        
        var nodes = traverse(individual.AST).nodes();
        var nodesIndex: number [] = [];
        var index: number = 0;
        
        traverse(individual.AST).forEach(function (node) {
            //console.log('Indice: ' + index);
            //console.log('Tipo ' + node.type);
            if(node && node.type && node.type == nodeType){ 
                nodesIndex.push(index);
            }
            
            index++;
        });
        
        return nodesIndex;
    }   
    
}