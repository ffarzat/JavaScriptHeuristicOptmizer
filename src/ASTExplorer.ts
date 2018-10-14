import esprima = require('esprima');
import fs = require('fs');
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import NodeIndex from './heuristics/NodeIndex';

import path = require('path');
import traverse = require('traverse');

var UglifyJS = require("uglify-es");


var uglifyOptions = {
    mangle: true,
    compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
    }
};


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
            newCtx.First.modificationLog = oldFirst.modificationLog;
            newCtx.First.removedIDS = oldFirst.removedIDS;

        }

        if (context.Second) {
            var oldSecond = context.Second;
            newCtx.Second = new Individual();
            //newCtx.Second['_astFile'] = new Buffer(oldSecond['_astFile'].data);
            //newCtx.Second.AST = JSON.parse(fs.readFileSync(oldSecond['_astFile'].path).toString());
            newCtx.Second.AST = oldSecond.astObj;
            newCtx.Second.testResults = oldSecond.testResults;
            newCtx.Second.typesRemoved = oldSecond.typesRemoved;
            newCtx.Second.modificationLog = oldSecond.modificationLog;
            newCtx.Second.removedIDS = oldSecond.removedIDS;
        }

        if (context.ActualBestForFunctionScope) {
            var oldActualBestForFunctionScope = context.ActualBestForFunctionScope;
            newCtx.ActualBestForFunctionScope = new Individual();
            newCtx.ActualBestForFunctionScope.AST = oldActualBestForFunctionScope.astObj;
            newCtx.ActualBestForFunctionScope.testResults = oldActualBestForFunctionScope.testResults;
            newCtx.ActualBestForFunctionScope.typesRemoved = oldActualBestForFunctionScope.typesRemoved;
            newCtx.ActualBestForFunctionScope.modificationLog = oldActualBestForFunctionScope.modificationLog;
            newCtx.ActualBestForFunctionScope.removedIDS = oldActualBestForFunctionScope.removedIDS;
        }

        if (context.Original) {
            var oldOriginal = context.Original;
            newCtx.Original = new Individual();
            //newCtx.Original['_astFile'] = new Buffer(oldOriginal['_astFile'].data); 
            //newCtx.Original.AST = JSON.parse(fs.readFileSync(oldOriginal['_astFile'].path).toString());
            newCtx.Original.AST = oldOriginal.astObj;
            newCtx.Original.testResults = oldOriginal.testResults;
            newCtx.Original.typesRemoved = oldOriginal.typesRemoved;
            newCtx.Original.modificationLog = oldOriginal.modificationLog;
            newCtx.Original.removedIDS = oldOriginal.removedIDS;
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
        var randomIndexNodeOne: number = this.GenereateRandom(0, context.First.removedIDS.length);
        var randomIndexNodeTwo: number = this.GenereateRandom(0, context.Second.removedIDS.length);

        console.log(context.Second.removedIDS[randomIndexNodeTwo]);
        console.log(context.First.removedIDS[randomIndexNodeOne]);
        
        //erases the nodes in each other
        this.deleteNodeById(context.First, context.Second.removedIDS[randomIndexNodeTwo]);
        this.deleteNodeById(context.Second, context.First.removedIDS[randomIndexNodeOne]);
                

        //Do Crossover
        var newSon: Individual = context.First.Clone();
        newSon.removedIDS.push(context.Second.removedIDS[randomIndexNodeTwo]);
        var newDaughter: Individual = context.Second.Clone();
        newDaughter.removedIDS.push(context.First.removedIDS[randomIndexNodeOne]);

        //If err in cross...
        try {
            newSon.ToCode();
        } catch (error) {
            newSon = context.Original.Clone();
        }

        try {
            newDaughter.ToCode();
        } catch (error) {
            newDaughter = context.Original.Clone();
        }
        
        var result: Individual[] = [newSon, newDaughter];
        //var result: Individual[] = [newSon, undefined];

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
     * Retrivies a node by its id
     */
    private deleteNodeById(individual: Individual, nodeId: string) {
        traverse(individual.AST).forEach(function (node) {
            if (node.ID == nodeId) {
                this.remove();
                this.stop();
            }
        });
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

        var localCode = mutant.ToCode();
        var result = UglifyJS.minify(localCode, uglifyOptions);

        mutant.modificationLog.push(`${mutant.LastNodeRemoved};${mutant.typesRemoved[mutant.typesRemoved.length - 1]};${result.code.length}`);

        return mutant;
    }

    /**
     * Releases a mutation over an AST  by node index
     */
    MutateBy(context: OperatorContext): Individual {
        const fs = require('fs');
        var mutant = context.First.Clone();
        var localNodeIndex = context.NodeIndex;
        var localGlobalIndexForinstructionType = context.globalIndexForinstructionType;
        var localType = context.instructionType;
        var counter = 0;
        var removedNodeId = '';

        //console.log(`[ASTExplorer.MutateBy]Index:${localNodeIndex}`);
        //fs.writeFileSync(`/home/fabio/Github/JavaScriptHeuristicOptmizer/build/mutante-antes.txt`, mutant.ToCode());

        //fs.appendFileSync('/home/fabio/Documents/JavaScriptHeuristicOptmizer/build/results/nos_excluidos.txt', localNodeIndex + ' = ' + escodegen.generate(this.GetNode(mutant, localNodeIndex)) + '\n\n\n');

        var removedNode = this.GetNode(mutant, localNodeIndex);
        removedNodeId = removedNode.ID;

        mutant.AST = traverse(mutant.AST).forEach(function (node) {
            if (counter == localNodeIndex) {
                if (node.type && node.type == "BlockStatement") {
                    console.log("\n" + localNodeIndex + "\n");
                    this.update({ "type": "BlockStatement", "body": [] });
                    this.stop();
                    return;
                }

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
        var localCode = mutant.ToCode();
        var result = UglifyJS.minify(localCode, uglifyOptions);

        mutant.modificationLog.push(`${localGlobalIndexForinstructionType};${localType};${result.code.length}`);
        mutant.removedIDS.push(removedNodeId);

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

                mutant.LastNodeRemoved = counter;
                //console.log(tipo);
                mutant.typesRemoved.push(tipo);
                mutant.removedIDS.push(node.ID);
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
    * Creates a GUID for each node inside a AST
    */
    IndexNodesGUID(individual: Individual) {
        const uuidv4 = require('uuid/v4');

        traverse(individual.AST).forEach(function (node) {
            if (node && node.type && (node.type != 'Line' && node.type != 'Block')) { //comments - Line and Block
                node.ID = uuidv4();
            }
        });
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
    IndexNodesBy(nodesType: string[], individual: Individual): Object {

        var nodes = traverse(individual.AST).nodes();

        var index: number = 0;
        var objetoGlobal = {};

        //var node = { "Type": nodeType, "ActualIndex": 0, "Indexes": index };

        traverse(individual.AST).forEach(function (node) {
            if (node && node.type && nodesType.indexOf(node.type) != -1) {

                var indiceDoTipo = objetoGlobal[node.type] == undefined ? { "Type": node.type, "ActualIndex": 0, "Indexes": [] } : objetoGlobal[node.type];
                indiceDoTipo['Indexes'].push(index);
                //console.log(`[ASTExplorer.IndexNodesBy]Tipo:${node.type}`);
                //console.log(`[ASTExplorer.IndexNodesBy]Indice:${index}`);
                //console.log(`[ASTExplorer.IndexNodesBy]total:${indiceDoTipo['Indexes'].length}`);
                //console.log(`[ASTExplorer.IndexNodesBy]Nó:${JSON.stringify(node)}`);
                objetoGlobal[node.type] = indiceDoTipo;
            }

            index++;
        });

        return objetoGlobal;
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