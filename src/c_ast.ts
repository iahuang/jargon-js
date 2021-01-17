function indentBody(string: string, width: number = 4) {
    return string
        .split("\n")
        .map((line) => " ".repeat(width) + line)
        .join("\n");
}

abstract class ASTNode {
    abstract dump(): string;
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

    // don't take out of context
    dumpBody() {
        return indentBody(this.body.map((node) => node.dump()).join("\n"));
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
