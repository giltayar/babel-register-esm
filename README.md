# babel-register-esm

An ESM loader for Babel, similar to @babel/register. It will transpile your files on-the-fly, based
on your "babelrc" configuration files.

For more information on Node.js ESM loaders,
see [here](https://nodejs.org/api/esm.html#esm_loaders).

## Installation

```sh
npm install babel-register-esm
```

This package has a peer-dependency on `@babel/core`, so you do need to install it yourself:

```sh
npm install --save-dev @babel/core
```

## Usage

To make on the fly transpilation work, you MUST run Node.js using `--loader babel-register-esm`.

Example:

```js
// a-file-with-jsx.js
import React from 'react'

console.log((<button>Hi</button>).type)
```

To run it under Node.js, without transpiling it beforehand, you need to run it thus:

```shell
node --loader babel-register-esm a-file-with-jsx.js
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

To use it in Mocha, add `loader=babel-register-esm` to the mocha arguments, e.g.

```shell
mocha --loader=babel-register-esm some-test.js
```

## API

There is no API. This is just an ESM loader.

### License

MIT
