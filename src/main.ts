namespace Jargon {
    export class GenerationParameters {
        size: number = 100; // target number lines of code
        pointerRatio: number = 0.5; // approximately what portion of types should be pointers

        // name generation
        maxNameLength: number = 24;
        nameAddChance: number = 0.3;

        maxConstLength: number = 16;
        constAddChance: number = 0.3;

        // variable definition generation
        numArgsRange: [number, number] = [1, 4];
        localVarsRange: [number, number] = [0, 5];
        globalVarsRange: [number, number] = [4, 16];

        // branch generation
        branchConditionsRange: [number, number] = [1, 3];
        elseChance: number = 0.5;

        // expression generation
        exprMaxDepth: number = 2; // limit nested expression components
        atomicChance: number = 0.5; // probability that the recursive "make expression" function will just return an atomic node

        // other
        maxDepth: number = 2; // limit of nested control flow blocks
        bodyFillRange: [number, number] = [1, 5]; // number of random "things" with which to fill bodies of functions, loops, etc. 
        literalChance: number = 0.3; // chance that a given symbol will be a literal

        static default() {
            return new GenerationParameters();
        }
    }

    const cNativeTypes = [
        "void",
        "int",
        "char",
        "bool",
        "long",
        "unsigned int",
    ];

    function randomItem<T>(items: T[]) {
        return items[Math.floor(Math.random() * items.length)];
    }
    function randInt<T>(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    interface ExternalFunction {
        name: string;
        args: number;
    }

    export class CodeGenerator {
        params: GenerationParameters;

        globalVars: string[] = [];
        currLocalVars: string[] = [];
        currArgs: string[] = [];

        // for added realism, we pretend that there are extra functions
        // as though included at the top of the file or something
        // these may be referenced to at any point in the code
        externalFunctions: ExternalFunction[] = [];

        get allUsableSymbols() {
            let s = [];
            s.push(...this.globalVars);
            s.push(...this.currLocalVars);
            s.push(...this.currArgs);

            return s;
        }

        get allLocalSymbols() {
            let s = [];
            s.push(...this.currLocalVars);
            s.push(...this.currArgs);

            return s;
        }

        constructor(params: GenerationParameters) {
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

            while (
                name.length < this.params.maxNameLength &&
                Math.random() < this.params.nameAddChance
            ) {
                name += "_" + randomItem(VAR_TERMS);
            }

            return name;
        }
        randomConstName() {
            let name = randomItem(CONST_TERMS);

            // make sure the name doesn't start with a number; most programming languages
            // don't allow this
            while ("0123456789".includes(name[0])) {
                name = randomItem(CONST_TERMS);
            }

            while (
                name.length < this.params.maxConstLength &&
                Math.random() < this.params.constAddChance
            ) {
                name += "_" + randomItem(CONST_TERMS);
            }

            return name;
        }
        randomFunction() {
            let rType = this.randomType();
            let name = this.randomName();
            let args = [];

            this.currArgs = [];

            for (let i = 0; i < randInt(...this.params.numArgsRange); i++) {
                let name = this.randomName();
                args.push(
                    new ArgumentNode(this.randomType(), name)
                );

                this.currArgs.push(name);
                
            }

            let fnode = new FunctionNode(rType, name, args, []);

            // generate function body

            let functionShouldReturn = rType != "void";

            let localVars = [];
            this.currLocalVars = [];
            for (let i = 0; i < randInt(...this.params.localVarsRange); i++) {
                let varType = this.randomType();
                let varName = this.randomName();
                localVars.push(new VarDecl(varType, varName));
                this.currLocalVars.push(varName);
            }

            fnode.body.push(...localVars);
            if (localVars.length) {
                fnode.body.push(new SpacerNode());
            }
            
            fnode.body.push(...this.randomBody());

            return fnode;
        }

        randomAtomic(possibleNames?: string[]) {
            /* 
                Returns an AtomicNode representing either a numeric literal or
                a named variable. If in the context of a function, a list of possible
                symbols may be passed to limit the names that can be used, otherwise one
                will be randomly generated.
            */

            if (Math.random() < this.params.literalChance) {
                let atomCont = this.randomLiteralString();
                return new AtomicNode(atomCont);
            } else {
                return this.randomNameAtomic(possibleNames);
            }
        }

        randomNameAtomic(possibleNames?: string[]) {
            let atomCont;
            if (possibleNames) {
                atomCont = randomItem(possibleNames);
            } else {
                atomCont = this.randomName();
            }
            return new AtomicNode(atomCont);
        }

        randomLiteralString() {
            if (Math.random() < 0.5) {
                return randInt(0, 255).toString();
            } else {
                let hexString = "";
                for (let i=0; i<randInt(1, 4); i++) {
                    hexString += randInt(0,16).toString(16) + randInt(0,16).toString(16);
                }
                return "0x"+hexString.toUpperCase();
            }
        }

        randomBody(depth: number = 0) {
            let body = [];

            for (let i=0; i<randInt(...this.params.bodyFillRange); i++) {
                let canNest = depth < this.params.maxDepth;
                // pick a "thing" to add to the body
                let nodeTypeSampler = new RandomSampler();
                nodeTypeSampler.add("assignment");
                nodeTypeSampler.add("return", 0.5);

                if (canNest) {
                    nodeTypeSampler.add("if-else");
                }

                let nodeType = nodeTypeSampler.sample();
                body.push(this.randomNodeOfType(nodeType, depth));

                if (nodeType == "return") {
                    break; // dont add anymore code after a return statement
                }
            }
            return body;
        }

        randomCondition() {
            /* Returns a random condition */
            
            let op = randomItem(["<",">","<=",">=","==","!="]);
            return new BinOpNode(
                this.randomExpression(0, false, false),
                this.randomExpression(0, false, true),
                op
            );
        }

        randomExpression(depth = 0, booleanExpression = false, allowNumericLiterals = true): ASTNode {
            /* Returns a random expression such as (a - (b + c)) or foo(a, b+c) */

            if (Math.random() < this.params.atomicChance || depth == this.params.exprMaxDepth && !(booleanExpression && depth==0)) {
                if (allowNumericLiterals) {
                    return this.randomAtomic(this.allUsableSymbols);
                } else {
                    return this.randomNameAtomic(this.allUsableSymbols);
                }
            } else {
                let exprTypeSampler = new RandomSampler();
                exprTypeSampler.add("binop");
                exprTypeSampler.add("fcall");
                exprTypeSampler.add("deref");
                exprTypeSampler.add("ref");

                let exprType = exprTypeSampler.sample();

                let subExpr = (allowNumericLiterals = true) => this.randomExpression(depth+1, booleanExpression, allowNumericLiterals);

                if (exprType == "binop") {
                    let operations;
                    if (booleanExpression) {
                        operations = ["<",">",">=","<=","==","!=", "||", "&&"];

                        if (depth > 0) {
                            // it doesn't make sense to say (a> = (b && c)), although probably
                            // syntactically okay with C's type coercion
                            operations = ["<", ">", ">=", "<=", "==", "!="];
                        }
                    } else {
                        operations = ["+","-","*"];
                    }

                    return new BinOpNode(
                        subExpr(),
                        subExpr(),
                        randomItem(operations)
                    );
                } else if(exprType == "fcall") {
                    let func = randomItem(this.externalFunctions);

                    let args = [];
                    for (let i=0; i<func.args; i++) {
                        args.push(subExpr());
                    }

                    return new FunctionCallNode(func.name, args);
                } else if(exprType == "deref") {
                    return new DereferenceNode(subExpr(false))
                } else if(exprType == "ref") {
                    return new ReferenceNode(subExpr(false))
                } else {
                    throw new Error();
                }
            }
        }

        randomNodeOfType(nodeType: string, depth: number): ASTNode {
            if (nodeType=="assignment") {
                let lefthand;

                if (Math.random() < 0.6) {
                    lefthand = this.randomNameAtomic(this.allLocalSymbols);
                } else {
                    lefthand = this.randomNameAtomic(this.allLocalSymbols);
                    lefthand = new DereferenceNode(lefthand);
                }

                let righthand = this.randomExpression();

                return new BinOpNode(lefthand, righthand, randomItem([
                    "=",
                    "=",
                    "=",
                    "+="
                ]));
            } else if (nodeType=="if-else") {
                let conditionals = [];

                for (let i=0; i<randInt(...this.params.branchConditionsRange); i++) {
                    let condition = this.randomCondition();
                    conditionals.push(new ConditionalNode(
                        condition,
                        this.randomBody(depth+1)
                    ))
                }

                let branchNode = new BranchNode(conditionals[0], conditionals.slice(1))
                return branchNode;
            } else if (nodeType=="return") {
                return new ReturnNode(this.randomExpression());
            } else {
                throw new Error();
            }
        }

        randomProgram() {
            let program = new ProgramRootNode([]);

            for (let i = 0; i < randInt(...this.params.globalVarsRange); i++) {
                program.body.push(new IncludeMacroNode(this.randomName()+".h"));
            }
            program.body.push(new SpacerNode());


            this.externalFunctions = [];

            for (let i = 0; i < 16; i++) {
                this.externalFunctions.push({
                    name: this.randomName(),
                    args: randInt(...this.params.numArgsRange)
                });
            }

            this.globalVars = [];
            for (let i = 0; i < randInt(...this.params.globalVarsRange); i++) {
                let name = this.randomConstName();
                this.globalVars.push(name);
                let globalVarDecl = new DefineMacroNode(
                    name,
                    new AtomicNode(this.randomLiteralString())
                );
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
}
