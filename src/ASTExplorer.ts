import esprima = require('esprima');
import fs = require('fs');
import Individual from './Individual';
import OperatorContext from './OperatorContext';

import path = require('path');
import traverse = require('traverse');

var escodegen = require('escodegen');
//var _ = require('underscore');

/**
* ASTExplorer
*/
export default class ASTExplorer {

    /**
     * Esprima Global Parser options 
     */
    globalOptions: esprima.Options = { raw: true, tokens: true, range: true, loc: true, comment: true };

    /**
     * Not included in Function Ranking
     */
    excludedFunctions = ['undefined', 'String', 'parseInt', 'parseFloat'];

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
     * Over websockets objects loose instance methods
     */
    Reload(context: OperatorContext): OperatorContext {
        var newCtx: OperatorContext = context; //all properties

        if (context.First) {
            var oldFirst = context.First;
            newCtx.First = new Individual();
            //newCtx.First['_astFile'] = new Buffer(oldFirst['_astFile'].data);
            //newCtx.First.AST = JSON.parse(fs.readFileSync(oldFirst['_astFile'].path).toString());
            newCtx.First.AST = oldFirst.astObj;
            newCtx.First.testResults = oldFirst.testResults;
            newCtx.First.typesRemoved = oldFirst.typesRemoved;
        }

        if (context.Second) {
            var oldSecond = context.Second;
            newCtx.Second = new Individual();
            //newCtx.Second['_astFile'] = new Buffer(oldSecond['_astFile'].data);
            //newCtx.Second.AST = JSON.parse(fs.readFileSync(oldSecond['_astFile'].path).toString());
            newCtx.Second.AST = oldSecond.astObj;
            newCtx.Second.testResults = oldSecond.testResults;
            newCtx.Second.typesRemoved = oldSecond.typesRemoved;
        }

        if (context.ActualBestForFunctionScope) {
            var oldActualBestForFunctionScope = context.ActualBestForFunctionScope;
            newCtx.ActualBestForFunctionScope = new Individual();
            newCtx.ActualBestForFunctionScope.AST = oldActualBestForFunctionScope.astObj;
            newCtx.ActualBestForFunctionScope.testResults = oldActualBestForFunctionScope.testResults;
            newCtx.ActualBestForFunctionScope.typesRemoved = oldActualBestForFunctionScope.typesRemoved;
        }

        if (context.Original) {
            var oldOriginal = context.Original;
            newCtx.Original = new Individual();
            //newCtx.Original['_astFile'] = new Buffer(oldOriginal['_astFile'].data); 
            //newCtx.Original.AST = JSON.parse(fs.readFileSync(oldOriginal['_astFile'].path).toString());
            newCtx.Original.AST = oldOriginal.astObj;
            newCtx.Original.testResults = oldOriginal.testResults;
            newCtx.Original.typesRemoved = oldOriginal.typesRemoved;
        }

        return newCtx;
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

            newSon = news[0] || context.First.Clone();
            newDaughter = news[1] || context.Second.Clone();

            if ((newSon.ToCode() != "" && newSon.ToCode() != originalCode) && (newDaughter.ToCode() != "" && newDaughter.ToCode() != originalCode)) {
                break;
            }
        }

        if (newSon == undefined || newDaughter == undefined) { //no way to cross! Dammit!
            newSon = context.First.Clone();
            newDaughter = context.Second.Clone();
        }

        newSon = this.ReconstruirIndividio(context, newSon);
        newDaughter = this.ReconstruirIndividio(context, newDaughter);

        return [newSon, newDaughter];
    }

    /**
     * Try to execute single point CrossOver operation
     */
    private TryCrossOver(context: OperatorContext): Individual[] {
        var indexesOne: number[] = this.IndexNodes(context.First);
        //var indexesTwo: number [] = this.IndexNodes(context.Second);
        var randomIndexNodeOne: number = this.GenereateRandom(0, indexesOne.length);
        var randomIndexNodeTwo: number = this.GenereateRandom(0, indexesOne.length);
        //var randomIndexNodeTwo: number = this.GenereateRandom(0, indexesTwo.length);

        //Gets the nodes
        var firstNode = this.GetNode(context.First, indexesOne[randomIndexNodeOne]);
        var secondNode = this.GetNode(context.First, indexesOne[randomIndexNodeTwo]);
        //var secondNode = this.GetNode(context.Second, indexesTwo[randomIndexNodeTwo]);

        //console.log('Node #1:' + JSON.stringify(firstNode));
        //console.log('Node #2:' + JSON.stringify(secondNode));

        //Do Crossover
        //var newSon: Individual = this.ReplaceNode(context.Second, indexesTwo[randomIndexNodeTwo], firstNode);
        var newSon: Individual = this.ReplaceNode(context.First, indexesOne[randomIndexNodeTwo], firstNode);
        //var newDaughter: Individual = this.ReplaceNode(context.First, indexesOne[randomIndexNodeOne], secondNode);

        //If err in cross...
        try {
            newSon.ToCode();
        } catch (error) {
            newSon = context.First.Clone();
        }

        /*
        try {
            newDaughter.ToCode();
        } catch (error) {
            newDaughter = context.Second.Clone();
        }
        */
        //var result: Individual[] = [newSon, newDaughter];
        var result: Individual[] = [newSon, undefined];

        return result;
    }


    /**
     * Replaces a node by index returning a brand new Individual
     */
    private ReplaceNode(individual: Individual, nodeIndex: number, nodeReplacement: any): Individual {
        var newOne = individual.Clone();
        var counter = 0;
        traverse(newOne.AST).forEach(function (x) {
            if (counter == nodeIndex) {
                //console.log('Actual Node' + JSON.stringify(this.node));
                //console.log('Replacement Node' + JSON.stringify(nodeReplacement));
                this.update(nodeReplacement);
                this.stop();
                //console.log('New Node' + JSON.stringify(this.node));
                //this.remove(true);
            }
            counter++;
        });

        return newOne;
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

        for (var index = 0; index < context.MutationTrials; index++) {
            //console.log(`Mutation trial ${index}`)
            mutant = this.TryMutate(context);
            var mutantCode = mutant.ToCode();

            if (mutantCode != "" && mutantCode != originalCode) {
                //const fs = require('fs');
                //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/${context.functionName}.txt`, mutantCode);
                break;
            }
        }

        if (mutant == undefined) { //no way to mutate! Dammit!
            mutant = context.First.Clone();
        }

        mutant = this.ReconstruirIndividio(context, mutant);

        return mutant;
    }

    /**
     * Releases a mutation over an AST  by node index
     */
    MutateBy(context: OperatorContext): Individual {
        const fs = require('fs');
        var mutant = context.First.Clone();
        var localNodeIndex = context.NodeIndex;
        var counter = 0;

        //console.log(`[ASTExplorer.MutateBy]Index:${localNodeIndex}`);
        //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/mutante-antes.txt`, mutant.ToCode());
        
        //fs.appendFileSync('/home/fabio/Documents/JavaScriptHeuristicOptmizer/build/results/nos_excluidos.txt', localNodeIndex + ' = ' + escodegen.generate(this.GetNode(mutant, localNodeIndex)) + '\n\n\n');

        mutant.AST = traverse(mutant.AST).forEach(function (node) {
            if (counter == localNodeIndex) {
                this.remove();
                //console.log(escodegen.generate(node));
                //console.log(`[ASTExplorer.MutateBy] Node:${JSON.stringify(node)}`);
                this.stop();
            }
            counter++;
        });
        
        //fs.writeFileSync(`/home/fabio/Documents/JavaScriptHeuristicOptmizer/build/results/${localNodeIndex}_mutant.txt`, mutant.ToCode());



        //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/${context.functionName}.txt`, mutant.ToCode());
        //console.log(`[ASTExplorer.MutateBy] Função: ${context.functionName}`);


        mutant = this.ReconstruirIndividio(context, mutant);

        

        return mutant;
    }

    /**
 * Reconstrói o código completo (Otimização por função)
 */
    ReconstruirIndividio(context: OperatorContext, mutant: Individual): Individual {

        if (context.nodesSelectionApproach == "ByFunction") {
            const fs = require('fs');

            //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/antes-reconstrucao.txt`, mutant.ToCode());
            //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/FuncaoBase.txt`, context.Original.ToCode());

            context.First = this.ReplaceFunctionNode(mutant, context.ActualBestForFunctionScope, context.functionName);
            mutant = context.First;

            //if (code.length > 0)
            //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/depois-reconstrucao.txt`, context.First.ToCode());
        }

        return mutant;
    }

    /**
     * Try to mutate an individual
     */
    private TryMutate(context: OperatorContext): Individual {
        var mutant = context.First.Clone();
        var indexes: number[] = this.IndexNodes(mutant);
        var counter = 0;
        var randonNodeToPrune: number = this.GenereateRandom(0, indexes.length - 1);

        //console.log(`rd node to remove ${randonNodeToPrune} of ${indexes.length}`);

        mutant.AST = traverse(mutant.AST).map(function (node) {
            if (counter == indexes[randonNodeToPrune]) {
                //fs.appendFileSync("mutante_excluidos.txt",JSON.stringify(node) + "\n");
                var tipo = ASTExplorer.extrairTipo(node);

                //console.log(tipo);
                mutant.typesRemoved.push(tipo);
                this.remove();
                this.stop();
            }
            counter++;
        });

        return mutant;
    }

    static extrairTipo(node: Object): string {
        //var nodes = traverse(individual.AST).nodes();
        var tipo = "";

        traverse(node).forEach(function (internalNode) {
            if (internalNode && internalNode.type) { //comments - Line and Block
                tipo = internalNode.type;
            }
        });

        return tipo;
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
    IndexNodes(individual: Individual): number[] {
        //var nodes = traverse(individual.AST).nodes();
        var nodesIndex: number[] = [];
        var index: number = 0;

        traverse(individual.AST).forEach(function (node) {
            if (node && node.type && (node.type != 'Line' && node.type != 'Block')) { //comments - Line and Block
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
    IndexNodesBy(nodeType: string, individual: Individual): number[] {

        var nodes = traverse(individual.AST).nodes();
        var nodesIndex: number[] = [];
        var index: number = 0;

        traverse(individual.AST).forEach(function (node) {
            if (node && node.type && node.type === nodeType) {
                nodesIndex.push(index);
                //console.log(`[ASTExplorer.IndexNodesBy]Tipo:${node.type}`);
                //console.log(`[ASTExplorer.IndexNodesBy]Indice:${index}`);
                //console.log(`[ASTExplorer.IndexNodesBy]Nó:${JSON.stringify(node)}`);
            }

            index++;
        });

        return nodesIndex;
    }


    /**
     * Make a Count of functions most used and return a dictionary of them
     */
    MakeFunctionStaticRanking(individual: Individual): any {

        var funcs = {};

        traverse(individual.AST).forEach((j) => {
            if (j && j.type == 'CallExpression') {
                var functionName = String(j.callee.name);

                if (this.excludedFunctions.indexOf(functionName) == -1) {

                    if (isNaN(parseFloat(funcs[functionName]))) {
                        funcs[functionName] = 0;
                    }

                    funcs[functionName] = parseInt(funcs[functionName] + 1);
                }
            }
        });

        return funcs;
    }

    /**
    * Atualiza um individuo com uma nova AST apenas em uma função
    */
    ReplaceFunctionNode(mutante: Individual, ActualBestForFunctionScope: Individual, functionName: string): Individual {
        var types = require("ast-types");
        var novoIndividuo = ActualBestForFunctionScope.Clone();

        types.visit(novoIndividuo.AST, {
            //FunctionDeclaration, FunctionExpression, ArrowFunctionExpression
            visitFunction: function (path) {
                var node = path.node;

                var internalName = "";

                if (node.type == 'FunctionDeclaration') {
                    internalName = node.id.name;
                }

                if (node.type == 'FunctionExpression') {
                    var expressionNode = path.parent;
                    if (expressionNode != undefined && expressionNode.value != undefined && expressionNode.value.left != undefined && expressionNode.value.left.property != undefined) {
                        internalName = expressionNode.value.left.property.name;
                    }
                }

                if (internalName == functionName) {
                    path.replace(mutante.AST);
                    this.abort();
                }
                else {
                    this.traverse(path);
                }
            }
        });
        return novoIndividuo;
    }

    /**
 * Recupera a AST da Função por nome
 */
    GetFunctionAstByName(individuo: Individual, functionName: string): Individual {
        var traverse = require('traverse');
        var novoIndividuo = undefined;

        var caminho = __dirname.replace('build', '');
        var functionExtractor = require(caminho + '/heuristics/function-extractor.js');
        var functions = functionExtractor.interpret(individuo.AST);
        var functionAST = undefined;

        //console.log(`Funções: ${functions.length}`);

        for (var i = 0; i < functions.length; i++) {
            var functionObj = functions[i];
            if (functionObj.name === functionName) {
                functionAST = functionObj.node
            }
        }

        if (functionAST != undefined) {
            //console.log(`${functionAST}`);
            novoIndividuo = new Individual();
            novoIndividuo.AST = functionAST;
        }

        return novoIndividuo;
    }
}