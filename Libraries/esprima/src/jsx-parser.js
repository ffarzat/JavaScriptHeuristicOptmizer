"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var character_1 = require('./character');
var token_1 = require('./token');
var parser_1 = require('./parser');
var xhtml_entities_1 = require('./xhtml-entities');
var jsx_syntax_1 = require('./jsx-syntax');
var Node = require('./nodes');
var JSXNode = require('./jsx-nodes');
var JSXToken;
(function (JSXToken) {
    JSXToken[JSXToken["Identifier"] = 100] = "Identifier";
    JSXToken[JSXToken["Text"] = 101] = "Text";
})(JSXToken || (JSXToken = {}));
token_1.TokenName[JSXToken.Identifier] = 'JSXIdentifier';
token_1.TokenName[JSXToken.Text] = 'JSXText';
// Fully qualified element name, e.g. <svg:path> returns "svg:path"
function getQualifiedElementName(elementName) {
    var qualifiedName;
    switch (elementName.type) {
        case jsx_syntax_1.JSXSyntax.JSXIdentifier:
            var id = (elementName);
            qualifiedName = id.name;
            break;
        case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
            var ns = (elementName);
            qualifiedName = getQualifiedElementName(ns.namespace) + ':' +
                getQualifiedElementName(ns.name);
            break;
        case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
            var expr = (elementName);
            qualifiedName = getQualifiedElementName(expr.object) + '.' +
                getQualifiedElementName(expr.property);
            break;
    }
    return qualifiedName;
}
var JSXParser = (function (_super) {
    __extends(JSXParser, _super);
    function JSXParser(code, options, delegate) {
        _super.call(this, code, options, delegate);
    }
    JSXParser.prototype.parsePrimaryExpression = function () {
        return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
    };
    JSXParser.prototype.startJSX = function () {
        // Unwind the scanner before the lookahead token.
        this.scanner.index = this.startMarker.index;
        this.scanner.lineNumber = this.startMarker.lineNumber;
        this.scanner.lineStart = this.startMarker.lineStart;
    };
    JSXParser.prototype.finishJSX = function () {
        // Prime the next lookahead.
        this.nextToken();
    };
    JSXParser.prototype.createJSXNode = function () {
        this.collectComments();
        return {
            index: this.scanner.index,
            line: this.scanner.lineNumber,
            column: this.scanner.index - this.scanner.lineStart
        };
    };
    JSXParser.prototype.createJSXChildNode = function () {
        return {
            index: this.scanner.index,
            line: this.scanner.lineNumber,
            column: this.scanner.index - this.scanner.lineStart
        };
    };
    JSXParser.prototype.scanXHTMLEntity = function () {
        var result = '&';
        var str = '';
        while (!this.scanner.eof()) {
            var ch = this.scanner.source[this.scanner.index++];
            if (ch === ';') {
                if (str[0] === '#') {
                    str = str.substr(1);
                    var hex = (str[0] === 'x');
                    var cp = hex ? parseInt('0' + str, 16) : parseInt(str, 10);
                    result = String.fromCharCode(cp);
                }
                else if (xhtml_entities_1.XHTMLEntities[str]) {
                    result = xhtml_entities_1.XHTMLEntities[str];
                }
                else {
                    result += ch;
                }
                break;
            }
            str += ch;
            result += ch;
        }
        return result;
    };
    // Scan the next JSX token. This replaces Scanner#lex when in JSX mode.
    JSXParser.prototype.lexJSX = function () {
        var cp = this.scanner.source.charCodeAt(this.scanner.index);
        // < > / : = { }
        if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
            var value = this.scanner.source[this.scanner.index++];
            return {
                type: token_1.Token.Punctuator,
                value: value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: this.scanner.index - 1,
                end: this.scanner.index
            };
        }
        // " '
        if (cp === 34 || cp === 39) {
            var start = this.scanner.index;
            var quote = this.scanner.source[this.scanner.index++];
            var str = '';
            while (!this.scanner.eof()) {
                var ch = this.scanner.source[this.scanner.index++];
                if (ch === quote) {
                    break;
                }
                else if (ch === '&') {
                    str += this.scanXHTMLEntity();
                }
                else {
                    str += ch;
                }
            }
            return {
                type: token_1.Token.StringLiteral,
                value: str,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        // ... or .
        if (cp === 46) {
            var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
            var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
            var value = (n1 === 46 && n2 === 46) ? '...' : '.';
            var start = this.scanner.index;
            this.scanner.index += value.length;
            return {
                type: token_1.Token.Punctuator,
                value: value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        // Identifer can not contain backslash (char code 92).
        if (character_1.Character.isIdentifierStart(cp) && (cp !== 92)) {
            var start = this.scanner.index;
            ++this.scanner.index;
            while (!this.scanner.eof()) {
                var ch = this.scanner.source.charCodeAt(this.scanner.index);
                if (character_1.Character.isIdentifierPart(ch) && (ch !== 92)) {
                    ++this.scanner.index;
                }
                else if (ch === 45) {
                    // Hyphen (char code 45) can be part of an identifier.
                    ++this.scanner.index;
                }
                else {
                    break;
                }
            }
            var id = this.scanner.source.slice(start, this.scanner.index);
            return {
                type: JSXToken.Identifier,
                value: id,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        this.scanner.throwUnexpectedToken();
    };
    JSXParser.prototype.nextJSXToken = function () {
        this.collectComments();
        this.startMarker.index = this.scanner.index;
        this.startMarker.lineNumber = this.scanner.lineNumber;
        this.startMarker.lineStart = this.scanner.lineStart;
        var token = this.lexJSX();
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.lineNumber = this.scanner.lineNumber;
        this.lastMarker.lineStart = this.scanner.lineStart;
        if (this.config.tokens) {
            this.tokens.push(this.convertToken(token));
        }
        return token;
    };
    JSXParser.prototype.nextJSXText = function () {
        this.startMarker.index = this.scanner.index;
        this.startMarker.lineNumber = this.scanner.lineNumber;
        this.startMarker.lineStart = this.scanner.lineStart;
        var start = this.scanner.index;
        var text = '';
        while (!this.scanner.eof()) {
            var ch = this.scanner.source[this.scanner.index];
            if (ch === '{' || ch === '<') {
                break;
            }
            ++this.scanner.index;
            text += ch;
            if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                ++this.scanner.lineNumber;
                if (ch === '\r' && this.scanner.source[this.scanner.index] === '\n') {
                    ++this.scanner.index;
                }
                this.scanner.lineStart = this.scanner.index;
            }
        }
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.lineNumber = this.scanner.lineNumber;
        this.lastMarker.lineStart = this.scanner.lineStart;
        var token = {
            type: JSXToken.Text,
            value: text,
            lineNumber: this.scanner.lineNumber,
            lineStart: this.scanner.lineStart,
            start: start,
            end: this.scanner.index
        };
        if ((text.length > 0) && this.config.tokens) {
            this.tokens.push(this.convertToken(token));
        }
        return token;
    };
    JSXParser.prototype.peekJSXToken = function () {
        var previousIndex = this.scanner.index;
        var previousLineNumber = this.scanner.lineNumber;
        var previousLineStart = this.scanner.lineStart;
        this.scanner.scanComments();
        var next = this.lexJSX();
        this.scanner.index = previousIndex;
        this.scanner.lineNumber = previousLineNumber;
        this.scanner.lineStart = previousLineStart;
        return next;
    };
    // Expect the next JSX token to match the specified punctuator.
    // If not, an exception will be thrown.
    JSXParser.prototype.expectJSX = function (value) {
        var token = this.nextJSXToken();
        if (token.type !== token_1.Token.Punctuator || token.value !== value) {
            this.throwUnexpectedToken(token);
        }
    };
    // Return true if the next JSX token matches the specified punctuator.
    JSXParser.prototype.matchJSX = function (value) {
        var next = this.peekJSXToken();
        return next.type === token_1.Token.Punctuator && next.value === value;
    };
    JSXParser.prototype.parseJSXIdentifier = function () {
        var node = this.createJSXNode();
        var token = this.nextJSXToken();
        if (token.type !== JSXToken.Identifier) {
            this.throwUnexpectedToken(token);
        }
        return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
    };
    JSXParser.prototype.parseJSXElementName = function () {
        var node = this.createJSXNode();
        var elementName = this.parseJSXIdentifier();
        if (this.matchJSX(':')) {
            var namespace = elementName;
            this.expectJSX(':');
            var name_1 = this.parseJSXIdentifier();
            elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
        }
        else if (this.matchJSX('.')) {
            while (this.matchJSX('.')) {
                var object = elementName;
                this.expectJSX('.');
                var property = this.parseJSXIdentifier();
                elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
            }
        }
        return elementName;
    };
    JSXParser.prototype.parseJSXAttributeName = function () {
        var node = this.createJSXNode();
        var attributeName;
        var identifier = this.parseJSXIdentifier();
        if (this.matchJSX(':')) {
            var namespace = identifier;
            this.expectJSX(':');
            var name_2 = this.parseJSXIdentifier();
            attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
        }
        else {
            attributeName = identifier;
        }
        return attributeName;
    };
    JSXParser.prototype.parseJSXStringLiteralAttribute = function () {
        var node = this.createJSXNode();
        var token = this.nextJSXToken();
        if (token.type !== token_1.Token.StringLiteral) {
            this.throwUnexpectedToken(token);
        }
        var raw = this.getTokenRaw(token);
        return this.finalize(node, new Node.Literal(token.value, raw));
    };
    JSXParser.prototype.parseJSXExpressionAttribute = function () {
        var node = this.createJSXNode();
        this.expectJSX('{');
        var expression = null;
        this.finishJSX();
        if (this.match('}')) {
            this.tolerateError('JSX attributes must only be assigned a non-empty expression');
        }
        expression = this.parseAssignmentExpression();
        this.startJSX();
        this.expectJSX('}');
        return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
    };
    JSXParser.prototype.parseJSXAttributeValue = function () {
        return this.matchJSX('{') ? this.parseJSXExpressionAttribute() :
            this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
    };
    JSXParser.prototype.parseJSXNameValueAttribute = function () {
        var node = this.createJSXNode();
        var name = this.parseJSXAttributeName();
        var value = null;
        if (this.matchJSX('=')) {
            this.expectJSX('=');
            value = this.parseJSXAttributeValue();
        }
        return this.finalize(node, new JSXNode.JSXAttribute(name, value));
    };
    JSXParser.prototype.parseJSXSpreadAttribute = function () {
        var node = this.createJSXNode();
        this.expectJSX('{');
        this.expectJSX('...');
        this.finishJSX();
        var argument = this.parseAssignmentExpression();
        this.startJSX();
        this.expectJSX('}');
        return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
    };
    JSXParser.prototype.parseJSXAttributes = function () {
        var attributes = [];
        while (!this.matchJSX('/') && !this.matchJSX('>')) {
            var attribute = this.matchJSX('{') ? this.parseJSXSpreadAttribute() :
                this.parseJSXNameValueAttribute();
            attributes.push(attribute);
        }
        return attributes;
    };
    JSXParser.prototype.parseJSXOpeningElement = function () {
        var node = this.createJSXNode();
        this.expectJSX('<');
        var name = this.parseJSXElementName();
        var attributes = this.parseJSXAttributes();
        var selfClosing = this.matchJSX('/');
        if (selfClosing) {
            this.expectJSX('/');
        }
        this.expectJSX('>');
        return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
    };
    JSXParser.prototype.parseJSXBoundaryElement = function () {
        var node = this.createJSXNode();
        this.expectJSX('<');
        if (this.matchJSX('/')) {
            this.expectJSX('/');
            var name_3 = this.parseJSXElementName();
            this.expectJSX('>');
            return this.finalize(node, new JSXNode.JSXClosingElement(name_3));
        }
        var name = this.parseJSXElementName();
        var attributes = this.parseJSXAttributes();
        var selfClosing = this.matchJSX('/');
        if (selfClosing) {
            this.expectJSX('/');
        }
        this.expectJSX('>');
        return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
    };
    JSXParser.prototype.parseJSXEmptyExpression = function () {
        var node = this.createJSXChildNode();
        this.collectComments();
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.lineNumber = this.scanner.lineNumber;
        this.lastMarker.lineStart = this.scanner.lineStart;
        return this.finalize(node, new JSXNode.JSXEmptyExpression());
    };
    JSXParser.prototype.parseJSXExpression = function () {
        var expression;
        if (this.matchJSX('}')) {
            expression = this.parseJSXEmptyExpression();
        }
        else {
            this.finishJSX();
            expression = this.parseAssignmentExpression();
            this.startJSX();
        }
        return expression;
    };
    JSXParser.prototype.parseJSXExpressionContainer = function () {
        var node = this.createJSXNode();
        this.expectJSX('{');
        var expression = this.parseJSXExpression();
        this.expectJSX('}');
        return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
    };
    JSXParser.prototype.parseJSXChildren = function () {
        var children = [];
        while (!this.scanner.eof()) {
            var node = this.createJSXChildNode();
            var token = this.nextJSXText();
            if (token.start < token.end) {
                var raw = this.getTokenRaw(token);
                var child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                children.push(child);
            }
            if (this.scanner.source[this.scanner.index] === '{') {
                var container = this.parseJSXExpressionContainer();
                children.push(container);
            }
            else {
                break;
            }
        }
        return children;
    };
    JSXParser.prototype.parseComplexJSXElement = function (el) {
        var stack = [];
        while (!this.scanner.eof()) {
            el.children = el.children.concat(this.parseJSXChildren());
            var node = this.createJSXChildNode();
            var element = this.parseJSXBoundaryElement();
            if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
                var opening = (element);
                if (opening.selfClosing) {
                    var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                    el.children.push(child);
                }
                else {
                    stack.push(el);
                    el = { node: node, opening: opening, closing: null, children: [] };
                }
            }
            if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
                el.closing = (element);
                var open_1 = getQualifiedElementName(el.opening.name);
                var close_1 = getQualifiedElementName(el.closing.name);
                if (open_1 !== close_1) {
                    this.tolerateError('Expected corresponding JSX closing tag for %0', open_1);
                }
                if (stack.length > 0) {
                    var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                    el = stack.pop();
                    el.children.push(child);
                }
                else {
                    break;
                }
            }
        }
        return el;
    };
    JSXParser.prototype.parseJSXElement = function () {
        var node = this.createJSXNode();
        var opening = this.parseJSXOpeningElement();
        var children = [];
        var closing = null;
        if (!opening.selfClosing) {
            var el = this.parseComplexJSXElement({ node: node, opening: opening, closing: closing, children: children });
            children = el.children;
            closing = el.closing;
        }
        return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
    };
    JSXParser.prototype.parseJSXRoot = function () {
        // Pop the opening '<' added from the lookahead.
        if (this.config.tokens) {
            this.tokens.pop();
        }
        this.startJSX();
        var element = this.parseJSXElement();
        this.finishJSX();
        return element;
    };
    return JSXParser;
}(parser_1.Parser));
exports.JSXParser = JSXParser;
