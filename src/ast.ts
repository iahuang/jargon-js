function indentBody(string: string, width: number = 4) {
    return string
        .split("\n")
        .map((line) => " ".repeat(width) + line)
        .join("\n");
}

abstract class ASTNode {
    abstract dump(): string;
}

class ProgramRootNode {
    body: ASTNode[];
    constructor(body: ASTNode[]) {
        this.body = body;
    }

    dump() {
        return this.body.map(node=>node.dump()).join("\n");
    }
}

class ArgumentNode extends ASTNode {
    type: string;
    name: string;

    constructor(type: string, name: string) {
        super();
        this.type = type;
        this.name = name;
    }

    dump() {
        return `${this.type} ${this.name}`;
    }
}

abstract class ContainerNode extends ASTNode {
    body: ASTNode[];

    constructor(body: ASTNode[]) {
        super();
        this.body = body;
    }
    addSemicolon(line: string) {
        if (!(line.endsWith("{") || line.endsWith("}") || line.endsWith(",") || line=="")) {
            return line+";";
        }
        return line;
    }
    // don't take out of context
    dumpBody() {
        return indentBody(
            this.body
                .map((node) => {
                    return this.addSemicolon(node.dump());
                })
                .join("\n")
        );
    }
}

class FunctionNode extends ContainerNode {
    returnType: string;
    name: string;
    args: ArgumentNode[];

    constructor(
        returnType: string,
        name: string,
        args: ArgumentNode[],
        body: ASTNode[]
    ) {
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
    condition: ASTNode;
    constructor(condition: ASTNode, body: ASTNode[]) {
        super(body);
        this.condition = condition;
    }
    dump(): never {
        throw new Error("Must call .dump() through a BranchNode object");
    }
}

class ElseNode extends ContainerNode {
    constructor(body: ASTNode[]) {
        super(body);
    }
    dump(): never {
        throw new Error("Must call .dump() through a BranchNode object");
    }
}

class BranchNode extends ASTNode {
    ifClause: ConditionalNode;
    elseIfClasues: ConditionalNode[];
    elseClause?: ElseNode;

    constructor(
        ifClause: ConditionalNode,
        elseIfClauses: ConditionalNode[] = [],
        elseClause?: ElseNode
    ) {
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
            ].join("\n");
        }

        if (this.elseClause) {
            output += [
                ` else {`,
                this.elseClause.dumpBody(),
                `}`
            ].join("\n");
        }

        return output;
    }
}

class BinOpNode extends ASTNode {
    a: ASTNode;
    b: ASTNode;
    op: string;
    constructor(a: ASTNode, b: ASTNode, op: string) {
        super();
        this.a = a;
        this.b = b;
        this.op = op;
    }

    dump() {
        return `${this.a.dump()} ${this.op} ${this.b.dump()}`;
    }
}

class VarDecl extends ASTNode {
    type: string;
    name: string;
    assignment?: ASTNode;

    constructor(type: string, name: string, assignment?: ASTNode) {
        super();
        this.type = type;
        this.name = name;
        this.assignment = assignment;
    }

    dump() {
        if (this.assignment) {
            return `${this.type} ${this.name} = ${this.assignment.dump()}`;
        } else {
            return `${this.type} ${this.name}`;
        }
        
    }
}

class IncludeMacroNode extends ASTNode {
    path: string;

    constructor (path: string) {
        super();
        this.path = path;
    }

    dump() {
        return "#include <"+this.path+">";
    }
}

class DefineMacroNode extends ASTNode {
    macroName: string;
    value: ASTNode;

    constructor (macroName: string, value: ASTNode) {
        super();
        this.macroName = macroName;
        this.value = value;
    }

    dump() {
        return `#define ${this.macroName} ${this.value.dump()}`;
    }
}

class AtomicNode extends ASTNode {
    value: string;

    constructor (value: string) {
        super();
        this.value = value;
    }

    dump() {
        return this.value;
    }
}

class SpacerNode extends ASTNode {
    dump () {
        return "";
    }
}

class DereferenceNode extends ASTNode {
    target: ASTNode;
    constructor (target: ASTNode) {
        super();
        this.target = target;
    }

    dump() {
        // return *foo instead of *(foo) when possible
        if (this.target instanceof AtomicNode) {
            return "*"+this.target.dump();
        } else {
            return `*(${this.target.dump()})`;
        }
    }
}


class ReferenceNode extends ASTNode {
    target: ASTNode;
    constructor (target: ASTNode) {
        super();
        this.target = target;
    }

    dump() {
        // return &foo instead of &(foo) when possible
        if (this.target instanceof AtomicNode) {
            return "&"+this.target.dump();
        } else {
            return `&(${this.target.dump()})`;
        }
    }
}

class FunctionCallNode extends ASTNode {
    name: string;
    args: ASTNode[];

    constructor(name: string, args: ASTNode[]) {
        super();
        this.name = name;
        this.args = args;
    }

    dump() {
        return `${this.name}(${this.args.map(arg=>arg.dump()).join(", ")})`;
    }
}

class ReturnNode extends ASTNode {
    value: ASTNode;

    constructor(value: ASTNode) {
        super();
        this.value = value;
    }

    dump() {
        return "return "+this.value.dump();
    }
}