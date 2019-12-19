'use strict';

const { describe, expect, it } = require('humile');
const path                     = require('path');
const file                     = require('../file');

describe('utils/file', () => {
  describe('readProjectFile', () => {
    const humilePath = path.join(process.cwd(), 'node_modules/humile');
    const humileColorPath = path.join(
      humilePath,
      'src/reporters/utils/color.js'
    );

    it('should load json', () => {
      const json = file.readProjectFile('package.json', humileColorPath);

      // eslint-disable-next-line no-underscore-dangle
      expect(json.__filename).toBe(path.join(humilePath, 'package.json'));
      expect(json.name).toBe('humile');
    });

    it('should load js', () => {
      const data = file.readProjectFile('color.js', humileColorPath);

      // eslint-disable-next-line no-underscore-dangle
      expect(data.__filename).toBe(humileColorPath);
      expect(data.green).toBeDefined();
    });
  });
});
