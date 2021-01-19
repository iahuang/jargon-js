"""
    Build script to process Typescript build output
"""

from datetime import datetime
import shutil


def indent(source, width=4):
    return "\n".join([" "*width + line for line in source.split("\n")])


with open("build/_jargon.js") as fl:
    build = fl.read()

# Wrap final build output into an anonymous function to avoid polluting the global scope
with open("build/jargon.js", "w") as fl:
    output = """
/*
    jargon.js

    Copyright (c) {0} Ian Huang
    Released under the MIT license: http://www.opensource.org/licenses/mit-license
    
    Compiled {1}
    
*/

(function() {{
{2}
window.Jargon = Jargon;
}})();
""".format(
        datetime.now().year,
        datetime.now().strftime("%B %d, %Y"),
        indent(build)
    )

    fl.write(output)

# make a copy of the build for the demo
shutil.copy("build/jargon.js", "docs/jargon.demo_build.js");