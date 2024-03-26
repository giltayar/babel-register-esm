# babel-register-esm

An ESM loader for Babel, similar to @babel/register. It will transpile your files on-the-fly, based
on your "babelrc" configuration files.

For more information on Node.js ESM loaders,
see [here](https://nodejs.org/api/esm.html#esm_loaders).

This loader also supports importing `.ts` and `.tsx` files, which in TypeScript needed to
be referred using their JS name (see [TypeScript](#typescript) section below).

## Installation

```sh
npm install babel-register-esm
```

This package has a peer-dependency on `@babel/core`, so you do need to install it yourself:

```sh
npm install --save-dev @babel/core
```

## Usage

To make on the fly transpilation work, you MUST run Node.js using `--import babel-register-esm`.

Example:

```js
// a-file-with-jsx.js
import React from 'react'

console.log((<button>Hi</button>).type)
```

To run it under Node.js, without transpiling it beforehand, you need to run it thus:

```shell
node --import babel-register-esm a-file-with-jsx.js
```

Note that in order for this to work, you need the appropriate `babelrc.json` and plugins installed.
E.g., for this example to work, you need to npm-install `@babel/plugin-transform-react-jsx"` and
your `babelrc.json` needs to look something like this:

```json
{
  "plugins": ["@babel/plugin-transform-react-jsx"]
}
```

## Usage in Mocha (and probably other test-runners)

To use it in Mocha, add `import=babel-register-esm` to the mocha arguments, e.g.

```shell
mocha --import=babel-register-esm some-test.js
```

## TypeScript

Since many projects use Babel to transpile TypeScript, this loader deals with a special case
for TypeScript ESM. When using TypeScriot in ESM projects, when importing a file, and you need
to specify the extension, you should specify `.js` and not `.ts` or `.tsx`! See
an example and explanations [here](https://gils-blog.tayar.org/posts/using-jsm-esm-in-nodejs-a-practical-guide-part-3/#section-07).

To deal with this, if you import a `.js` file, where you meant to import `.ts` files
this loader will try and resolve the non-existant `.js` file to a `.ts` or `.tsx` file (in that
order).

Example:

```ts
// imported.ts
console.log('loading imported.ts')

// importing.ts
import './imported.js' // yes, `.js` is what *should* be specified as extension!

console.log('loadeing importing.ts')
```

The above will work, even though `imported.js` does not exist, because this loader
will also alternatively search for the same file with a `.ts` and `.tsx` extension.

Note that you still have to specify a `.babelrc.json` that transpiles TypeScript and TSX. The loader
will not transpile this for you. An working example for such a `.babelrc.json` would be:

```json
{
  "plugins": [
    ["@babel/plugin-transform-typescript", {"isTSX": true}],
    "@babel/plugin-transform-react-jsx"
  ],
  "include": ["**/*.ts", "**/*.tsx"]
}
```

## API

There is no API. This is just an ESM loader.

### License

MIT
