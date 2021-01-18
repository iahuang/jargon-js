function updateHighlighting() {
    document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
    });   
}

let params = Jargon.GenerationParameters.default();
let codeGen = new Jargon.CodeGenerator(params);
let codeContainer = document.getElementById("main");

function generateNew() {
    // generate program and dump contents into a string
    let code = codeGen.randomProgram().dump();

    codeContainer.innerHTML = `
<pre>
<code class="language-c">
${code}
</code>
</pre>
    `;

    document.getElementById("filename").innerText = '"'+codeGen.randomName()+".c\"";

    updateHighlighting();
}

generateNew();

// set body background color to be consistent with that of the rest of the code

let bgColor = getComputedStyle(codeContainer.children[0].children[0]).backgroundColor;
document.body.style.backgroundColor = bgColor;