namespace Jargon {
    export class GenerationParameters {
        size: number = 100; // target number lines of code
        pointerRatio: number = 0.5; // approximately what portion of types should be pointers

        maxNameLength: number = 24;
        nameAddChance: number = 0.3;

        maxConstLength: number = 16;
        constAddChance: number = 0.3;

        numArgsRange: [number, number] = [1, 4];
        localVarsRange: [number, number] = [0, 5];
        globalVarsRange: [number, number] = [4, 16];

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

    export class CodeGenerator {
        params: GenerationParameters;
        globalVars: string[] = [];

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

            for (let i = 0; i < randInt(...this.params.numArgsRange); i++) {
                args.push(
                    new ArgumentNode(this.randomType(), this.randomName())
                );
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
            } else {
                let hexString = "";
                for (let i=0; i<randInt(1, 4); i++) {
                    hexString += randInt(0,16).toString(16) + randInt(0,16).toString(16);
                }
                return "0x"+hexString.toUpperCase();
            }
        }

        randomProgram() {
            let program = new ProgramRootNode([]);
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
