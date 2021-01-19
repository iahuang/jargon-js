# jargon-js
A Javascript library for making randomly generated C-style code snippets 

### [Demo](https://iahuang.github.io/jargon-js/)

Use cases:
- Making those stock images that have a bunch of glowing blue code on a computer screen
- Yes

## Quick Start

You can find a distribution of this project located at `build/jargon.js`

## Notes

- This library is by no means lightweight, due to the built-in wordlists. As of right now, the build is around 3MB in size.

## Building from Source

Run `tsc` to compile then run `post.py` to do additional bundling and post-processing steps.

The raw build output from `tsc` will be located at `build/_jargon.js`