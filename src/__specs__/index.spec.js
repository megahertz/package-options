'use strict';

const { describe, expect, it } = require('humile');
const options                  = require('..');

describe('index', () => {
  it('should return default PackageOptions', () => {
    options
      .reset()
      .loadCmd('arg -a 1 --b 2')
      .loadEnv('my', { MY_C: 3 });

    expect(options.a).toBe(1);
    expect(options.b).toBe(2);
    expect(options.c).toBe(3);
  });

  it('should parse help nested keys', () => {
    options
      .reset()
      .param('debug.showFileOperations', { default: false })
      .help(`
        -a, --debug.show-api-calls Display API calls
        -q, --debug.show-queries Display API calls
      `)
      .loadCmd('-aq');

    expect(options.debug).toEqual({
      showApiCalls: true,
      showFileOperations: false,
      showQueries: true,
    });
  });
});
