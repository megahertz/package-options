# package-options
[![Build Status](https://travis-ci.org/megahertz/package-options.svg?branch=master)](https://travis-ci.org/megahertz/package-options)
[![NPM version](https://badge.fury.io/js/package-options.svg)](https://badge.fury.io/js/package-options)
[![Dependencies status](https://david-dm.org/megahertz/package-options/status.svg)](https://david-dm.org/megahertz/package-options)

The single point to load config for your node package

It reads:

- command line arguments
- environment variables
- `package.json`
- `${yourPackage}.config.json`
- `${yourPackage}.config.js`
- other custom sources

Features:

- Converts options from CLI and ENV to camelCase

  `--log-level` → `logLevel`; `MY_LOG_LEVEL` → `logLevel`
  
- Converts negative flags like

  `--no-log` → `log = false`
  
- Converts dot-separated values to object

  `--filter.name John` → `{ filter: { name: 'John' } }`
  
- Converts number and boolean parameters to the corresponding type
  

## Usage

1. Install with [npm](https://npmjs.org/package/package-options):

    npm install -g package-options
    
2. Use in your code
  
```js
// $ env MYMODULE_DEBUG=yes mymodule arg1 -a -b 1 -c 1 -c 2
import options from 'package-options';

console.log(options._); // ['arg1']
console.log(options.a); // true
console.log(options.b); // 1
console.log(options.c); // [1, 2]
console.log(options.debug); // true
```

### Data sources
Let's imagine the project of some end-user:

```
some-project
├─┬node_modules
│ ├─┬mymodule        - the NPM package you're working on
│ │ └──index.js      - const options = require('package-options');
│ ├──package-options
│ └──...
├──index.js
└──package.js        - "dependencies": { "mymodule": "*" }
```

`mymodule` might be installed global instead, in that case the behavior
is the same

So, end-user runs `npx mymodule --some-arg 1`. By default, 'package-options':
- Determines a name of the parent module (`mymodule`).
- Reads `mymodule` section of `some-project/package.json`
- Reads `some-project/mymodule.config.json`
- Reads `some-project/mymodule.config.js`
- Reads all environment variables which have 'MYMODULE' prefix
- Reads command lines arguments

If you want to skip options loading from the default sources:

```js
options.reset() // skip loading from default sources
  .loadCmd()
  .loadFile('my-custom.config.json');
```

#### Load options from another sources

- From object

  `options.load({ someOptions: 1 })`
  
- From command line

  `options.loadCmd(process.argv.slice(2))`
  
  argument `argv` is optional
  
- From environment variables

  `options.loadEnv('MY', process.env) // only ENV vars prefixed with 'MY'`
  `options.loadEnv(['NODE_ENV', 'LOG']) // only exact ENV vars`
  
  all arguments are optional
  
- From file
  
  `options.loadFile('.mymodulerc')`
  `options.loadFile(['config.js', 'other.mymodule'])`
  
  `loadFile()` loads file content from some-project/${fileName}. If there is
  no such a file, it tries to find it in upper folders. If the second argument
  is specified, it reads only the data at specified path of data object. JS and
  JSON files are supported.
  
### Read and write options

You can easily manipulate options:

`console.log(options.someValue)`
`options.someValue = 2`

There are helpers `.get()` and `.set()` which allow to easily manipulate
nested data without existence check:

`options.get('not.existed.key', 'Default value')`
`options.set('not.existed.key', 'Parent objects will be created')`

To get a pure JS object contained all loaded options you can call
`options.toJSON()`

### Better parameters processing

```js
options.param('log.level', { // can be applied to a nested parameter
  alias: 'l',
  type: 'number', // number, string or boolean
  default: 2,
})
```

All keys of the second argument are optional.

Here is an shortcut to define parameters with boolean type:

```js
options.boolean(['showLine', 'colors']);
```

### Displaying help text

The package has a helper which simplifies help printing in CLI. It can:
 - automatically normalize space indents
 - parse command line arguments from help text
 
```js
options.help(`
  Usage: mymodule [OPTIONS]
  Options:
    -f, --file STRING       Input file
    -l, --log-level NUMBER  Log level 0-5
        --help              Show this help
`, helpOptions)
```

Using this help text has the same effect as:

```js
options
  .param('file', { alias: 'f', type: 'string' })
  .param('logLevel', { alias: 'l', type: 'number' })
```

The optional second argument of `.help()` may contain the following options:

- `autoShow`: if false, it won't process `--help` CLI argument automatically
- `paddingBottom`: add n blank lines before the text
- `paddingLeft`: add n leading spaces
- `paddingTop`: add n blank lines after the text

### Additional settings

`package-options` has the following options itself, which can be set using 
`options.config(cfg)` method:

- name: Explicitly set parent package name
- params: You can set parameters here instead of callings `.param()`
- inferTypes: By default, `package-options` tries to convert parameters from CLI
  and ENV to the corresponding type, like '2' → 2, 'yes' → true. Set false to
  disable.
- projectPath: By default, it uses `process.cwd()` to get the path of the
  current project (path to `some-project` in the example above). The path
  is used by `.loadFile()`. If you need to get this path in you code use 
  `options.getProjectPath()`.
  
