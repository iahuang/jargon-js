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
