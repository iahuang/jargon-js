"""
    Script for processing Linux kernel name dataset
"""

import re

with open("symbol_names.txt") as fl:
    names = fl.read().split("\n")

terms = set()

"""
    Split names into individual "terms" 
    e.g. "ioctl_deallocate_iso_resource" becomes
    ["ioctl", "deallocate", "iso", "resource"].

    We can generate new names by mixing and matching
    individual terms

"""
for name in names:
    for term in name.split("_"):
        terms.add(term)

newTerms = set()

# Only include terms that are no more than 50% numbers
for term in terms:
    if term == "":
        continue
    numberRatio = len(re.findall("\d", term)) / len(term)
    if numberRatio > 0.5 and len(term) > 3:
        pass
    else:
        newTerms.add(term)

terms = newTerms

# Sort terms into that for use in constant names (all uppercase)
# and those that are to be used in variables, functions, etc.

constantTerms = set()
variableTerms = set()

for term in terms:
    # check for lowercase letters
    hasLowercase = term.upper() != term

    if hasLowercase:
        variableTerms.add(term)
    else:
        constantTerms.add(term)

# Export wordlist files
with open("terms.txt", "w") as fl:
    fl.write("\n".join(sorted(list(terms))))

with open("vars.txt", "w") as fl:
    fl.write("\n".join(sorted(list(variableTerms))))

with open("const.txt", "w") as fl:
    fl.write("\n".join(sorted(list(constantTerms))))
    
