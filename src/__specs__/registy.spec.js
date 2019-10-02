'use strict';

const { describe, expect, it } = require('humile');
const path                     = require('path');
const { getInstance }          = require('../registry');

describe('registry', () => {
  it('should return different instance for different files', () => {
    const nodeModules = path.resolve(__dirname, '../../node_modules');
    const humile = path.resolve(nodeModules, 'src/index.js');
    const eslint = path.resolve(nodeModules, 'eslint/bin/eslint.js');

    expect(getInstance(humile)).toBe(getInstance(humile));
    expect(getInstance(humile)).not.toBe(getInstance(eslint));
    expect(getInstance(null)).not.toBe(getInstance(humile));
  });
});
