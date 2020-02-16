'use strict';

/* eslint-disable no-underscore-dangle */

const { parseCmdArgs }                     = require('./utils/cmd');
const { findProjectRoot, readProjectFile } = require('./utils/file');
const { parseHelp }                        = require('./utils/help');
const {
  deepCopy,
  deepMerge,
  filterByKeyPrefix,
  filterByKeys,
  getNode,
  setNode,
} = require('./utils/object');
const {
  camelCaseToSnake,
  processParams,
  transform,
} = require('./utils/transform');

class PackageOptions {
  constructor(data = {}, selfOptions = {}) {
    this.__data = { _: [], ...data };
    this.__selfOptions = Object.assign({
      help: undefined,
      inferTypes: true,
      initialized: false,
      name: undefined,
      params: {},
      projectPath: findProjectRoot(),
      version: undefined,
    }, selfOptions);

    this.proxy = new Proxy(this, {
      get(target, property) {
        if (property in target) {
          return target[property];
        }

        target.init();

        return target.__data[property];
      },

      set(target, property, value) {
        target.__data[property] = value;
        return true;
      },
    });

    this.default = this.proxy;
    this.reset = this.reset.bind(this);

    return this.proxy;
  }

  boolean(parameters) {
    if (!Array.isArray(parameters)) {
      parameters = [parameters];
    }

    parameters.forEach((paramName) => {
      this.param(paramName, { type: 'boolean' });
    });

    return this.proxy;
  }

  clone() {
    return new PackageOptions(
      deepCopy(this.__data),
      deepCopy(this.__selfOptions)
    );
  }

  class() {
    return PackageOptions;
  }

  config(values) {
    Object.assign(this.__selfOptions, values);
    return this.__selfOptions;
  }

  get(option, defaultValue = undefined) {
    return getNode(this.__data, option, defaultValue);
  }

  getHelpText() {
    return this.__selfOptions.help;
  }

  getProjectPath() {
    return this.__selfOptions.projectPath;
  }

  help(helpText, options = {}) {
    // eslint-disable-next-line prefer-const
    let { params, text } = parseHelp(helpText, options);

    this.__selfOptions.help = text;

    params = transform(params, {
      keyToLowerCase: false,
      keyNested: false,
    });

    Object.entries(params)
      .forEach(([param, opts]) => this.param(param, opts));

    this.init();

    if (options.autoShow !== false && this.__data.help === true) {
      console.info(text);
      process.exit(0);
    }

    return this.proxy;
  }

  load(data) {
    deepMerge(this.__data, processParams(data, this.__selfOptions.params));
    return this.proxy;
  }

  loadCmd(args = process.argv.slice(2)) {
    if (typeof args === 'string') {
      args = args.trim().split(' ');
    }

    const cmdOptions = transform(parseCmdArgs(args, this.getBooleans()), {
      keyToLowerCase: false,
      valuePrimitives: this.__selfOptions.inferTypes,
    });

    this.load(cmdOptions);

    if (this.__data.version === true && this.__selfOptions.version) {
      console.info(this.__selfOptions.version);
      process.exit(0);
    }

    return this.proxy;
  }

  loadDefaults(packagePrefix = this.__selfOptions.name) {
    if (!packagePrefix) {
      return this.loadCmd();
    }

    return this
      .loadFile('package.json', packagePrefix)
      .loadFile(`${packagePrefix}.config.json`)
      .loadFile(`${packagePrefix}.config.js`)
      .loadEnv(packagePrefix.replace(/-/g, '_'))
      .loadCmd();
  }

  loadEnv(filter = null, envValues = process.env) {
    if (filter) {
      if (Array.isArray(filter)) {
        envValues = filterByKeys(envValues, filter);
      } else {
        envValues = filterByKeyPrefix(envValues, filter);
      }
    }

    const envOptions = transform(envValues, {
      valuePrimitives: this.__selfOptions.inferTypes,
    });

    return this.load(envOptions);
  }

  loadFile(fileName, section = null) {
    let json = readProjectFile(fileName, this.__selfOptions.projectPath);
    delete json.__filename;

    if (section) {
      json = getNode(json, section, {});
    }

    return this.load(json);
  }

  param(name, options) {
    this.__selfOptions.params[name] = {
      ...this.__selfOptions.params[name],
      ...options,
    };

    return this.proxy;
  }

  reset() {
    this.__data = { _: [] };
    this.__selfOptions.initialized = true;
    return this.proxy;
  }

  set(option, value) {
    setNode(this.__data, option, value);
    return this.proxy;
  }

  toJSON() {
    return this.__data;
  }

  /**
   * @private
   */
  init() {
    if (this.__selfOptions.initialized) {
      return;
    }

    this.loadDefaults();
    this.__selfOptions.initialized = true;
  }

  /**
   * @private
   */
  getBooleans() {
    const array = Object.entries(this.__selfOptions.params)
      .filter(([name, options]) => options.type === 'boolean')
      .reduce((fields, [name, options]) => {
        const snakeName = camelCaseToSnake(name);
        fields.add(name);
        fields.add(snakeName);
        fields.add('no' + name[0].toUpperCase() + name.substr(1));
        fields.add('no-' + snakeName);

        if (options.alias) {
          fields.add(options.alias);
        }

        return fields;
      }, new Set());

    return new Set(array);
  }
}

module.exports = PackageOptions;
