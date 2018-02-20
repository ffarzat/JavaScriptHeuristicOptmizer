/*
  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.

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
"use strict";
var comment_handler_1 = require('./comment-handler');
var parser_1 = require('./parser');
var jsx_parser_1 = require('./jsx-parser');
var tokenizer_1 = require('./tokenizer');
function parse(code, options, delegate) {
    var commentHandler = null;
    var proxyDelegate = function (node, metadata) {
        if (delegate) {
            delegate(node, metadata);
        }
        if (commentHandler) {
            commentHandler.visit(node, metadata);
        }
    };
    var parserDelegate = (typeof delegate === 'function') ? proxyDelegate : null;
    if (options) {
        var collectComment = (typeof options.comment === 'boolean' && options.comment);
        var attachComment = (typeof options.attachComment === 'boolean' && options.attachComment);
        if (collectComment || attachComment) {
            commentHandler = new comment_handler_1.CommentHandler();
            commentHandler.attach = attachComment;
            options.comment = true;
            parserDelegate = proxyDelegate;
        }
    }
    var parser;
    if (options && typeof options.jsx === 'boolean' && options.jsx) {
        parser = new jsx_parser_1.JSXParser(code, options, parserDelegate);
    }
    else {
        parser = new parser_1.Parser(code, options, parserDelegate);
    }
    var ast = (parser.parseProgram());
    if (parser.config.comment) {
        ast.comments = commentHandler.comments;
    }
    if (parser.config.tokens) {
        ast.tokens = parser.tokens;
    }
    if (parser.config.tolerant) {
        ast.errors = parser.errorHandler.errors;
    }
    return ast;
}
exports.parse = parse;
function tokenize(code, options, delegate) {
    var tokenizer = new tokenizer_1.Tokenizer(code, options);
    var tokens;
    tokens = [];
    try {
        while (true) {
            var token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            if (delegate) {
                token = delegate(token);
            }
            tokens.push(token);
        }
    }
    catch (e) {
        tokenizer.errorHandler.tolerate(e);
    }
    if (tokenizer.errorHandler.tolerant) {
        tokens.errors = tokenizer.errors();
    }
    return tokens;
}
exports.tokenize = tokenize;
var syntax_1 = require('./syntax');
exports.Syntax = syntax_1.Syntax;
// Sync with *.json manifests.
exports.version = '3.0.0';
