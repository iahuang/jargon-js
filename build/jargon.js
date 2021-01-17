
/*
    jargon.js

    Copyright (c) 2021 Ian Huang

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
    "use strict";
    function indentBody(string, width = 4) {
        return string
            .split("\n")
            .map((line) => " ".repeat(width) + line)
            .join("\n");
    }
    class ASTNode {
    }
    class ArgumentNode extends ASTNode {
        constructor(type, name) {
            super();
            this.type = type;
            this.name = name;
        }
        dump() {
            return `${this.type} ${this.name}`;
        }
    }
    class ContainerNode extends ASTNode {
        constructor(body) {
            super();
            this.body = body;
        }
        // don't take out of context
        dumpBody() {
            return indentBody(this.body.map((node) => node.dump()).join("\n"));
        }
    }
    class FunctionNode extends ContainerNode {
        constructor(returnType, name, args, body) {
            super(body);
            this.returnType = returnType;
            this.name = name;
            this.args = args;
        }
        dump() {
            return [
                `${this.returnType} ${this.name} (${this.args
                    .map((arg) => arg.dump())
                    .join(", ")}) {`,
                this.dumpBody(),
                `}`,
            ].join("\n");
        }
    }
    // auto-generated by build_wordlist.py
    
})();