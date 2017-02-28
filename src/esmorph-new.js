/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint node:true browser:true plusplus:true */
/*global define:true,esmorph:true,esprima:true */

(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('esprima'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'esprima'], function (exports, esprima) {
            factory((root.esmorph = exports), esprima);
        });
    } else {
        // Browser globals
        factory((root.esmorph = {}), root.esprima);
    }
}(this, function (exports, esprima) {
    'use strict';

    // Executes visitor on the object and its children (recursively).

    function traverse(object, visitor, path) {
        var key, child;

        if (typeof path === 'undefined') {
            path = [];
        }

        visitor.call(null, object, path);
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    traverse(child, visitor, [object].concat(path));
                }
            }
        }
    }

    // Insert fragments into the string, return a new string.

    function insert(str, fragments) {
        var i, fragment, pos;

        // Sort in descending order since a fragment needs to be
        // inserted from the last one, to prevent offsetting the others.
        fragments.sort(function (a, b) {
            return b.index - a.index;
        });

        for (i = 0; i < fragments.length; i += 1) {
            fragment = fragments[i];
            pos = Math.floor(fragment.index);
            str = str.slice(0, pos) + fragment.text + str.slice(pos);
        }

        return str;
    }

    // Find a return statement within a function which is the exit for
    // the said function. If there is no such explicit exit, a null
    // will be returned instead.

    function findExit(functionNode) {
        var exit = null;

        function isFunction(node) {
            return node.type && node.range &&
                (node.type === esprima.Syntax.FunctionDeclaration ||
                node.type === esprima.Syntax.FunctionExpression);
        }

        traverse(functionNode, function (node, path) {
            var i, parent;
            if (node.type === esprima.Syntax.ReturnStatement) {
                for (i = 0; i < path.length; ++i) {
                    parent = path[i];
                    if (isFunction(parent)) {
                        if (parent.range === functionNode.range) {
                            exit = node;
                        }
                        break;
                    }
                }
            }
        });

        return exit;
    }

    // Find every function expression and declaration, also deduce the name
    // on a best-effort basis.

    function collectFunction(code, tree) {
        var functionList = [];

        traverse(tree, function (node, path) {
            var name, parent;

            if (node.type === esprima.Syntax.FunctionDeclaration) {
                name = node.id.name;
            } else if (node.type === esprima.Syntax.FunctionExpression) {
                parent = path[0];
                if (parent.type === esprima.Syntax.AssignmentExpression) {
                    if (typeof parent.left.range !== 'undefined') {
                        name = code.slice(parent.left.range[0], parent.left.range[1]).replace(/"/g, '\\"');
                    }
                } else if (parent.type === esprima.Syntax.VariableDeclarator) {
                    name = parent.id.name;
                } else if (parent.type === esprima.Syntax.CallExpression) {
                    name = parent.callee.id ? parent.callee.id.name : '[Anonymous]';
                } else if (typeof parent.length === 'number') {
                    name = parent.id ? parent.id.name : '[Anonymous]';
                } else if (typeof parent.key !== 'undefined') {
                    if (parent.key.type === 'Identifier') {
                        if (parent.value === node && parent.key.name) {
                            name = parent.key.name;
                        }
                    }
                }
            }
            if (name) {
                name = name.replace(/'/g, "\\'");
                functionList.push({ name: name, node: node, exit: findExit(node) });
            }
        });

        return functionList;
    }

    // Insert a prolog in the body of every function.
    // It will be in the form of a function call:
    //
    //     traceName(object);
    //
    // where the object contains the following properties:
    //
    //    'name' holds the name of the function
    //    'line' holds the starting line number of the function block
    //    'range' contains the index-based range of the function
    //
    // The name of the function represents the associated reference for
    // the function (deduced on a best-effort basis if it is not
    // a function declaration).
    //
    // If traceName is a function instead of a string, it will be invoked and
    // the result will be used as the entire prolog. The arguments for the
    // invocation are the function name, range, and location info.

    function traceFunctionEntrance(traceName) {

        return function (code) {
            var tree, i, functionList, fragments,
                name, line, range, pos, signature;

            tree = esprima.parse(code, { range: true, loc: true });
            functionList = collectFunction(code, tree);

            // Populate the fragments to be inserted into the code.

            fragments = [];
            for (i = 0; i < functionList.length; i += 1) {
                name = functionList[i].name;
                line = functionList[i].node.loc.start.line;
                range = functionList[i].node.range;
                pos = functionList[i].node.body.range[0] + 1;
                var params = functionList[i].node.params;
		        var body = functionList[i].node.body;
                if (typeof traceName === 'function') {
                    signature = traceName.call(null, {
                        name: name,
                        line: line,
                        range: range,
                        paramData: params,  // Added for flagger.js
			            body: body, // Added for flagger.js field mod check
                    });
                } else {
                    signature = traceName + '({ ';
                    signature += 'name: \'' + name + '\', ';
                    signature += 'lineNumber: ' + line + ', ';
                    signature += 'range: [' + range[0] + ', ' + range[1] + '] ';
                    signature += '});';
                }
                signature = '\n' + signature;
                fragments.push({
                    index: pos,
                    text: signature
                });
            }

            return fragments;
        };
    } 

    function traceFunctionExit(traceName) {

        return function (code) {
            var tree, i, j, functionList, fragments,
                name, line, range, pos, signature, exit;

            tree = esprima.parse(code, { range: true, loc: true });
            functionList = collectFunction(code, tree);

            // Populate the fragments to be inserted into the code.

            fragments = [];
            for (i = 0; i < functionList.length; i += 1) {
                name = functionList[i].name;
                line = functionList[i].node.loc.start.line;
                range = functionList[i].node.range;
                pos = functionList[i].node.body.range[1] - 1;
                exit = functionList[i].exit;

                if (typeof traceName === 'function') {
                    signature = traceName.call(null, {
                        name: name,
                        line: line,
                        range: range
                    });
                } else {
                    signature = traceName + '({ ';
                    signature += 'name: \'' + name + '\', ';
                    signature += 'lineNumber: ' + line + ', ';
                    signature += 'range: [' + range[0] + ', ' + range[1] + '] ';
                    signature += '});';
                }
                signature = '\n' + signature + '\n';
                for (j = 1; j < functionList[i].node.loc.end.column; ++j) {
                    signature += ' ';
                }
                fragments.push({
                    index: pos + 0.2,
                    text: signature
                });

                if (exit) {
                    if (typeof traceName === 'function') {
                        signature = traceName.call(null, {
                            name: name,
                            line: exit.loc.start.line,
                            range: range,
                            return: true
                        });
                    } else {
                        signature = traceName + '({ ';
                        signature += 'name: \'' + name + '\', ';
                        signature += 'lineNumber: ' + exit.loc.start.line + ', ';
                        signature += 'range: [' + range[0] + ', ' + range[1] + '], ';
                        signature += 'return: true ';
                        signature += '});';
                    }
                    signature = '\n' + signature + '\n';
                    for (j = 1; j < exit.loc.start.column; ++j) {
                        signature += ' ';
                    }
                    fragments.push({
                        index: exit.range[0],
                        text: signature
                    });
                }
            }

            return fragments;
        };
    }

    // Find every variable declaration. Also store the array of variable names declared on this line.
    function collectVariableDeclaration(code, tree) {
        var declarationList = [];

        traverse(tree, function (node, path) {
            var name, parent;

            if (node.type === esprima.Syntax.VariableDeclaration && node.kind === "var") {
                var names = node.declarations.map(function(val) { return val.id.name});
                declarationList.push({names: names, node: node });
            }
        });

        return declarationList;
    }

    /* Added for fun -- Sophia 

    Must be passed a function. 
    Calls the given function (traceName) after each var declaration, passing in 
    the parameter 'declarations' containing the Esprima declarations object for 
    parsed code of type "VariableDeclaration". 'declarations' is an array containing
    objects of type 'VariableDeclarator'. The array willf have length > 1 if there are
    multiple declarations on a single line (ex, var a = 1, b = 2)
    */
    function traceVariableDeclaratorAfter(traceName) {

        return function (code) {
            var tree, i, fragments,
                line, range, pos, signature;
            tree = esprima.parse(code, { range: true, loc: true });
            var declarationList = collectVariableDeclaration(code, tree);
            // Populate the fragments to be inserted into the code.
            fragments = [];
            for (i = 0; i < declarationList.length; i += 1) {
                line = declarationList[i].node.loc.start.line;
                range = declarationList[i].node.range;
                pos = declarationList[i].node.range[1];
                var names = declarationList[i].names
                var declarations = declarationList[i].node.declarations;
                if (typeof traceName === 'function') {
                    signature = traceName.call(null, {
                        names: names,
                        line: line,
                        range: range,
                        declarations: declarations,  
                    });
                } 
                signature = '\n' + signature;
                fragments.push({
                    index: pos,
                    text: signature
                });
            }

            return fragments;
        };
    } 

    /* Find every object of the genericType and return it. -- Sophia
       Each object must also pass the optional filter function  */
    function collectGenericObjects(code, tree, genericType, optionalFilter) {
        var objs = [];
        if (!optionalFilter) {
            optionalFilter = function(node) {
                return true;
            }
        }
        traverse(tree, function (node, path) {
            var name, parent;
            if (node.type === genericType && optionalFilter(node)) {
                objs.push({node: node });
            }
        });
        return objs;
    }

    var InstrumentableLine = {
      BreakStatement: 'BreakStatement',
      ContinueStatement: 'ContinueStatement',
      EmptyStatement: 'EmptyStatement', 
      ExpressionStatement: 'ExpressionStatement',  
      ReturnStatement: 'ReturnStatement',
      ThrowStatement: 'ThrowStatement', 
      VariableDeclaration: 'VariableDeclaration'
    }

    var InstrumentableBlock = {
      CatchClause: 'CatchClause', 
      ForStatement: 'ForStatement',
      ForInStatement: 'ForInStatement',
      FunctionDeclaration: 'FunctionDeclaration', // function a() { }
      FunctionExpression: 'FunctionExpression', // anonymous function. function() { … }
      IfStatement: 'IfStatement', // if statement
      SwitchStatement: 'SwitchStatement', // switch statement
      TryStatement: 'TryStatement',
      WhileStatement: 'WhileStatement',
      WithStatement: 'WithStatement'
    }


    var WhereEnum = {
        BEFORE: "before",
        AFTER: "after", 
        START: "start", 
        END: "end", 
    }


    /* Added to extend instrumentation to be able to instrument generic lines. -- Sophia 

    Must be passed a function. 
    Calls the given function (traceName) after each line of the generic syntax type
    where that line's node passes the optional filter function. Passes in 
    the parameter 'node' containing the Esprima node type. 
    */
    function traceInstrumentableLine(traceName, whereEnum, genericType, optionalFilter) {
        if (!InstrumentableLine[genericType]) {
            console.log("Error: type " + genericType + " is not an instrumentable line.")
            return
        }
        return function (code) {
            var tree, i, fragments,
                line, range, pos, signature;
            tree = esprima.parse(code, { range: true, loc: true });
            var lines = collectGenericObjects(code, tree, genericType, optionalFilter);

            // Populate the fragments to be inserted into the code.
            fragments = [];
            for (i = 0; i < lines.length; i += 1) {
                line = lines[i].node.loc.start.line;
                range = lines[i].node.range;
                if (typeof traceName === 'function') {
                    signature = traceName.call(null, {
                        line: line,
                        range: range,
                        node: lines[i].node
                    });
                }
                if (whereEnum === WhereEnum.AFTER) {
                    pos = lines[i].node.range[1];
                    signature = '\n' + signature;
                } else if (whereEnum == WhereEnum.BEFORE) {
                    pos = lines[i].node.range[0];
                    signature = signature + '\n';
                } else {
                    console.log("ERROR: illegal enum type " + whereEnum + ", must be either before or after." )
                    return
                }

                fragments.push({
                    index: pos,
                    text: signature
                });
            }
            return fragments;
        };
    }

    /* Added to extend instrumentation to be able to instrument generic blocks. -- Sophia 

    Must be passed a function. 
    Calls the given function (traceName) after each line of the generic syntax type
    where that line's node passes the optional filter function. Passes in 
    the parameter 'node' containing the Esprima node type. 
    */
    function traceInstrumentableBlock(traceName, whereEnum, genericType, optionalFilter) {
        if (!InstrumentableBlock[genericType]) {
            console.log("Error: type " + genericType + " is not an instrumentable block.")
            return
        }
        return function (code) {
            var tree, i, fragments,
                line, range, pos, signature;
            tree = esprima.parse(code, { range: true, loc: true });
            var blocks = collectGenericObjects(code, tree, genericType, optionalFilter);

            // Populate the fragments to be inserted into the code.
            fragments = [];
            for (i = 0; i < blocks.length; i += 1) {
                line = blocks[i].node.loc.start.line;
                range = blocks[i].node.range;
                var body = blocks[i].node.body;
                if (typeof traceName === 'function') {
                    signature = traceName.call(null, {
                        line: line,
                        range: range,
                        node: blocks[i].node
                    });
                }
                if (whereEnum === WhereEnum.START) {
                    pos = blocks[i].node.body.range[0] + 1;
                    signature = '\n' + signature;
                } else if (whereEnum === WhereEnum.END) {
                    pos = blocks[i].node.body.range[1] - 1;
                    console.log(blocks[i].node.body.range)
                    signature =  signature + '\n';
                } else if (whereEnum === WhereEnum.AFTER) {
                    pos = blocks[i].node.range[1];
                    signature = '\n' + signature;
                } else if (whereEnum === WhereEnum.BEFORE) {
                    pos = blocks[i].node.range[0];
                    signature = signature + '\n';
                } else {
                    console.log("ERROR: illegal enum type " + whereEnum);
                    return
                }

                fragments.push({
                    index: pos,
                    text: signature
                });
            }
            return fragments;
        };
    }


    function modify(code, modifier) {
        var i, morphers, fragments;

        if (Object.prototype.toString.call(modifier) === '[object Array]') {
            morphers = modifier;
        } else if (typeof modifier === 'function') {
            morphers = [ modifier ];
        } else {
            throw new Error('Wrong use of esmorph.modify() function');
        }

        fragments = [];
        for (i = 0; i < morphers.length; ++i) {
            fragments = fragments.concat(morphers[i].call(null, code));
        }

        return insert(code, fragments);
    }


    //   DoWhileStatement: 'DoWhileStatement', 
    // Sync with package.json.
    exports.version = '0.0.0-dev';

    exports.modify = modify;

    exports.Where = WhereEnum; 
    exports.Tracer = {
        FunctionEntrance: traceFunctionEntrance,
        FunctionExit: traceFunctionExit,
        VariableDeclaratorAfter: traceVariableDeclaratorAfter,  // Added Sophia
        InstrumentableLine: traceInstrumentableLine, // Added Sophia
        InstrumentableBlock: traceInstrumentableBlock // Added Sophia
    };

}));



/* notes on esprima.Syntax
{ AssignmentExpression: 'AssignmentExpression',  // subpart of an ExpressionStatement
  ArrayExpression: 'ArrayExpression',
  BlockStatement: 'BlockStatement',
  BinaryExpression: 'BinaryExpression',
  BreakStatement: 'BreakStatement',
  CallExpression: 'CallExpression',
  CatchClause: 'CatchClause', // subpart of a TryStatement.
  ConditionalExpression: 'ConditionalExpression',
  ContinueStatement: 'ContinueStatement',
  DoWhileStatement: 'DoWhileStatement',
  DebuggerStatement: 'DebuggerStatement',
  EmptyStatement: 'EmptyStatement',
  ExpressionStatement: 'ExpressionStatement',  // looks pretty generic. b={} or b.foo = 3
  ForStatement: 'ForStatement',
  ForInStatement: 'ForInStatement',
  FunctionDeclaration: 'FunctionDeclaration',
  FunctionExpression: 'FunctionExpression',
  Identifier: 'Identifier',
  IfStatement: 'IfStatement',
  Literal: 'Literal',
  LabeledStatement: 'LabeledStatement',
  LogicalExpression: 'LogicalExpression',
  MemberExpression: 'MemberExpression',
  NewExpression: 'NewExpression',
  ObjectExpression: 'ObjectExpression',
  Program: 'Program',
  Property: 'Property',
  ReturnStatement: 'ReturnStatement',
  SequenceExpression: 'SequenceExpression',
  SwitchStatement: 'SwitchStatement',
  SwitchCase: 'SwitchCase',
  ThisExpression: 'ThisExpression',
  ThrowStatement: 'ThrowStatement',
  TryStatement: 'TryStatement',  // try {code} catch(error) {code} generates it
  UnaryExpression: 'UnaryExpression',
  UpdateExpression: 'UpdateExpression',
  VariableDeclaration: 'VariableDeclaration',  // var a = 30 generates it.
  VariableDeclarator: 'VariableDeclarator', // subpart of a variable declaration.
  WhileStatement: 'WhileStatement',  // while(test) generates it.
  WithStatement: 'WithStatement'    // with(object) {some code} generates it. 
  }
*/