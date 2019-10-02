'use strict';

const { describe, expect, it } = require('humile');
const PackageOptions           = require('../PackageOptions');

describe('PackageOptions', () => {
  it('should create a clone', () => {
    const options = new PackageOptions({ a: 1 });

    expect(options.clone().toJSON()).toEqual({ _: [], a: 1 });
  });

  it('should allow to read some options', () => {
    const options = new PackageOptions({ a: 1 });

    expect(options.a).toBe(1);
    expect(options.get('a')).toBe(1);
  });

  it('should allow to write some options', () => {
    const options = new PackageOptions({ a: 1 });

    options.a = 2;
    expect(options.a).toBe(2);

    options.set('a.b', 3);
    expect(options.a.b).toBe(3);
  });

  it('should allow to load options from an object', () => {
    const options = new PackageOptions({ a: { b: { c1: 1 } } });

    options.load({ a: { b: { c2: 2 } } });

    expect(options.a).toEqual({ b: { c1: 1, c2: 2 } });
  });

  it('should allow to load options from a command line', () => {
    const options = new PackageOptions(
      { a: 1 },
      { params: { 'b.val': { alias: 'b' } } }
    );

    options.loadCmd(
      '-b 2 -c 1 -c 2 --value1 1 --value2=2 argv --d.d1 1 --d.d2 2'
    );

    expect(options.toJSON()).toEqual({
      _: ['argv'],
      a: 1,
      b: { val: 2 },
      c: [1, 2],
      d: { d1: 1, d2: 2 },
      value1: 1,
      value2: 2,
    });
  });

  describe('should load environment variables', () => {
    it('using string filter', () => {
      const options = new PackageOptions({ a: 1 });

      options.loadEnv('my', {
        VAL: 1,
        MY_VAL: 2,
        OTHER: 3,
        my_other_val: 4,
      });

      expect(options.toJSON()).toEqual({
        _: [],
        a: 1,
        val: 2,
        otherVal: 4,
      });
    });

    it('using array filter', () => {
      const options = new PackageOptions({ a: 1 });

      options.loadEnv(['VAL', 'MY_VAL'], {
        VAL: 1,
        MY_VAL: 2,
        OTHER: 3,
        my_other_val: 4,
      });

      expect(options.toJSON()).toEqual({
        _: [],
        a: 1,
        val: 1,
        myVal: 2,
      });
    });
  });

  it('should load a JSON file from the package root', () => {
    const options = new PackageOptions({ a: 1 });

    options.loadFile('.eslintrc', 'env');

    expect(options.toJSON()).toEqual({
      _: [],
      a: 1,
      browser: true,
      es6: true,
      jasmine: true,
    });
  });

  it('should return project path', () => {
    const options = new PackageOptions();

    options.config({ projectPath: '/' });

    expect(options.getProjectPath()).toBe('/');
  });

  it('should parse help', () => {
    const options = new PackageOptions();
    options.help(`
      Usage mypackage [OPTIONS]
      Options:
        -f, --fileName STRING       Input file
        -l, --log-level NUMBER  Log level
        -q, --quiet             Prevent console output
            --debug             Debug mode
    `);
    options.loadCmd('--f myfile.json -l 2 -q --no-debug');
    expect(options.toJSON()).toEqual({
      _: [],
      debug: false,
      fileName: 'myfile.json',
      logLevel: 2,
      quiet: true,
    });
  });

  it('should allow to reset itself', () => {
    const options = new PackageOptions({ a: 1 });

    options.reset();

    expect(options.toJSON()).toEqual({ _: [] });
  });
});
