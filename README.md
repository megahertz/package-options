# package-options
[![Build Status](https://travis-ci.org/megahertz/package-options.svg?branch=master)](https://travis-ci.org/megahertz/package-options)
[![NPM version](https://badge.fury.io/js/package-options.svg)](https://badge.fury.io/js/package-options)
[![Dependencies status](https://david-dm.org/megahertz/package-options/status.svg)](https://david-dm.org/megahertz/package-options)

The single point to load options for your node package

It loads and merges option parameters from:

- command line arguments
- environment variables
- `package.json`
- `YOUR_PACKAGE.config.json`
- `YOUR_PACKAGE.config.js`
- Other custom files

Features:

- Converts options from CLI and ENV to camelCase
  ( --log-level → `logLevel`; MY_LOG_LEVEL → `logLevel` )
- Converts negative flags like --no-flag
  ( --no-log → `log = false`)
- Converts dot-separated values to object
  ( --filter.name John → `{ filter: { name: 'John' } }`)
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
Let's imagine the following project of some end-user:

```
some-project
├─┬node_modules
│ ├─┬mymodule        - the NPM package you're working on
│ │ └──index.js      - `const options = require('package-options');`
│ ├──package-options
│ └──...
├──index.js
└──package.js        - "dependencies": { "mymodule": "*" }
```

mymodule could be installed global instead, in that case the behavior
is the same

So, end-user runs `npx mymodule --some-arg 1`. By default, 'package-options':
- Determines a name of the parent module (`mymodule`).
- Reads `mymodule` section of `some-project/package.json`
- Reads `some-project/mymodule.config.json`
- Reads `some-project/mymodule.config.js`
- Reads all environment variables which have 'MYMODULE' prefix
- Reads command lines arguments

If you want to skip data loading from the default sources:

```js
options.reset() // skip loading of default sources
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
  `options.loadEnv(['config.js', 'other.mymodule']) // only exact ENV vars`
  
  `loadFile()` loads file content from some-project/${fileName}. If there is
  no such a file, it tries to read in parent folders. If the second argument
  is specified it reads only the data at specified path of data object. JS and
  JSON files are supported.
  
### Read and write options

You can easily manipulate options:

`console.log(options.someValue)`
`options.someValue = 2`

There are helper `get` and `set` functions which allow to easily manipulate
nested data without existence check:

`options.get('not.existed.key', 'Default value')`
`options.set('not.existed.key', 'Parent bject will be created')`

To receive a pure JS object contained all loaded options you can call
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

### Help helper

The package has a helper which simplifies help printing in console. It can:
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

Specifying the help text has the same effect as:

```js
options
  .param('file', { alias: 'f', type: 'string' })
  .param('logLevel', { alias: 'l', type: 'number' })
```

Optional helpOptions argument could contain the following options:

- autoShow: if false, help text won't be displayed automatically when `--help`
  command line flag is specified
- paddingBottom: blank lines count before the text
- paddingLeft: leading spaces count
- paddingTop: blank lines count after the text

### Additional settings

`package-options` has the following options itself, which can be set using 
`options.config(cfg)` method:

- name: Explicitly set parent package name
- params: You can set parameters here instead of callings `.param()`
- inferTypes: By default, `package-options` tries to convert parameters from CLI
  and ENV to the corresponding type, like '2' → 2, 'yes' → true. Set to false to
  disable.
- projectPath: By default, the path of the current project
  (`some-project` in example above) is determine using `process.cwd()`. The path
  is used by `.loadFile()`. If you need to read this path in you code call 
  `options.getProjectPath()`.
  
