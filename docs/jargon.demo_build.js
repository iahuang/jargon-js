
/*
    jargon.js

    Copyright (c) 2021 Ian Huang
    Released under the MIT license: http://www.opensource.org/licenses/mit-license
    
    Compiled January 18, 2021
    
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
    class ProgramRootNode {
        constructor(body) {
            this.body = body;
        }
        dump() {
            return this.body.map(node => node.dump()).join("\n");
        }
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
    class ConditionalNode extends ContainerNode {
        constructor(condition, body) {
            super(body);
            this.condition = condition;
        }
        dump() {
            throw new Error("Must call .dump() through a BranchNode object");
        }
    }
    class ElseNode extends ContainerNode {
        constructor(body) {
            super(body);
        }
        dump() {
            throw new Error("Must call .dump() through a BranchNode object");
        }
    }
    class BranchNode extends ASTNode {
        constructor(ifClause, elseIfClauses = [], elseClause) {
            super();
            this.ifClause = ifClause;
            this.elseIfClasues = elseIfClauses;
            this.elseClause = elseClause;
        }
        dump() {
            let output = "";
            output += [
                `if (${this.ifClause.condition.dump()}) {`,
                this.ifClause.dumpBody(),
                `}`,
            ].join("\n");
            for (let elseIfClause of this.elseIfClasues) {
                output += [
                    ` else if (${elseIfClause.condition.dump()}) {`,
                    elseIfClause.dumpBody(),
                    `}`
                ];
            }
            if (this.elseClause) {
                output += [
                    ` else {`,
                    this.elseClause.dumpBody(),
                    `}`
                ];
            }
            return output;
        }
    }
    class BinOpNode extends ASTNode {
        constructor(a, b, op) {
            super();
            this.a = a;
            this.b = b;
            this.op = op;
        }
        dump() {
            return `${this.a} ${this.op} ${this.b}`;
        }
    }
    class VarDecl extends ASTNode {
        constructor(type, name, assignment) {
            super();
            this.type = type;
            this.name = name;
            this.assignment = assignment;
        }
        dump() {
            if (this.assignment) {
                return `${this.type} ${this.name} = ${this.assignment.dump()};`;
            }
            else {
                return `${this.type} ${this.name};`;
            }
        }
    }
    class DefineMacroNode extends ASTNode {
        constructor(macroName, value) {
            super();
            this.macroName = macroName;
            this.value = value;
        }
        dump() {
            return `#define ${this.macroName} ${this.value.dump()}`;
        }
    }
    class AtomicNode extends ASTNode {
        constructor(value) {
            super();
            this.value = value;
        }
        dump() {
            return this.value;
        }
    }
    class SpacerNode extends ASTNode {
        dump() {
            return "";
        }
    }
    var Jargon;
    (function (Jargon) {
        class GenerationParameters {
            constructor() {
                this.size = 100; // target number lines of code
                this.pointerRatio = 0.5; // approximately what portion of types should be pointers
                this.maxNameLength = 24;
                this.nameAddChance = 0.3;
                this.maxConstLength = 16;
                this.constAddChance = 0.3;
                this.numArgsRange = [1, 4];
                this.localVarsRange = [0, 5];
                this.globalVarsRange = [4, 16];
                this.literalChance = 0.3; // chance that a given symbol will be a literal
            }
            static default() {
                return new GenerationParameters();
            }
        }
        Jargon.GenerationParameters = GenerationParameters;
        const cNativeTypes = [
            "void",
            "int",
            "char",
            "bool",
            "long",
            "unsigned int",
        ];
        function randomItem(items) {
            return items[Math.floor(Math.random() * items.length)];
        }
        function randInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        class CodeGenerator {
            constructor(params) {
                this.globalVars = [];
                this.params = params;
            }
            randomType() {
                let sampler = new RandomSampler();
                for (let t of cNativeTypes) {
                    sampler.add(t);
                }
                sampler.add(randomItem(VAR_TERMS), 2);
                let type = sampler.sample();
                if (Math.random() < this.params.pointerRatio) {
                    type = type + "*";
                }
                return type;
            }
            randomName() {
                let name = randomItem(VAR_TERMS);
                // make sure the name doesn't start with a number; most programming languages
                // don't allow this
                while ("0123456789".includes(name[0])) {
                    name = randomItem(VAR_TERMS);
                }
                while (name.length < this.params.maxNameLength &&
                    Math.random() < this.params.nameAddChance) {
                    name += "_" + randomItem(VAR_TERMS);
                }
                return name;
            }
            randomConstName() {
                let name = randomItem(CONST_TERMS);
                while (name.length < this.params.maxConstLength &&
                    Math.random() < this.params.constAddChance) {
                    name += "_" + randomItem(CONST_TERMS);
                }
                return name;
            }
            randomFunction() {
                let rType = this.randomType();
                let name = this.randomName();
                let args = [];
                for (let i = 0; i < randInt(...this.params.numArgsRange); i++) {
                    args.push(new ArgumentNode(this.randomType(), this.randomName()));
                }
                let fnode = new FunctionNode(rType, name, args, []);
                // generate function body
                let functionShouldReturn = rType != "void";
                let localVars = [];
                for (let i = 0; i < randInt(...this.params.localVarsRange); i++) {
                    let varType = this.randomType();
                    let varName = this.randomName();
                    localVars.push(new VarDecl(varType, varName));
                }
                fnode.body.push(...localVars);
                return fnode;
            }
            randomAtomic() {
            }
            randomLiteralString() {
                if (Math.random() < 0.5) {
                    return randInt(0, 255).toString();
                }
                else {
                    let hexString = "";
                    for (let i = 0; i < randInt(1, 4); i++) {
                        hexString += randInt(0, 16).toString(16) + randInt(0, 16).toString(16);
                    }
                    return "0x" + hexString.toUpperCase();
                }
            }
            randomProgram() {
                let program = new ProgramRootNode([]);
                this.globalVars = [];
                for (let i = 0; i < randInt(...this.params.globalVarsRange); i++) {
                    let name = this.randomConstName();
                    this.globalVars.push(name);
                    let globalVarDecl = new DefineMacroNode(name, new AtomicNode(this.randomLiteralString()));
                    program.body.push(globalVarDecl);
                }
                program.body.push(new SpacerNode());
                for (let i = 0; i < 10; i++) {
                    program.body.push(this.randomFunction());
                    program.body.push(new SpacerNode());
                }
                return program;
            }
        }
        Jargon.CodeGenerator = CodeGenerator;
    })(Jargon || (Jargon = {}));
    class RandomSampler {
        constructor() {
            this.choices = [];
            this.weights = [];
            this._markers = [];
        }
        add(choice, weight = 1) {
            this.choices.push(choice);
            this.weights.push(weight);
            // compile markers
            this._markers = [];
            let sumWeights = 0;
            for (let w of this.weights) {
                sumWeights += w;
            }
            let currMarker = 0;
            for (let w of this.weights) {
                currMarker += w;
                this._markers.push(currMarker / sumWeights);
            }
            return this; // allow function chaining
        }
        sample() {
            let n = Math.random();
            for (let i = 0; i < this.choices.length; i++) {
                let marker = this._markers[i];
                let choice = this.choices[i];
                if (n < marker) {
                    return choice;
                }
            }
            throw new Error("");
        }
    }
    // auto-generated by build_wordlist.py
    
window.Jargon = Jargon;
})();