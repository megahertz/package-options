'use strict';

const { describe, expect, it } = require('humile');
const transform                = require('../transform');

describe('utils/transform', () => {
  describe('transform', () => {
    it('should perform multiple transforms', () => {
      const src = {
        int: '12',
        nested: {
          'SOME_VAL': 'YES',
        },
        'nested.value.first': '1',
        'nested.value.second': '2',
        'no-flag': true,
        TEST_VAL: 1,
      };

      expect(transform.transform(src))
        .toEqual({
          flag: false,
          int: 12,
          nested: {
            someVal: true,
            value: {
              first: 1,
              second: 2,
            },
          },
          testVal: 1,
        });
    });

    it('should allow to disable some transforms', () => {
      expect(transform.transform({ TEST_VAL: '1' }, { keyToCamelCase: false }))
        .toEqual({ test_val: 1 });
    });

    it('should perform multiple transforms nested objects correctly', () => {
      const src = {
        int: '12',
        'nested.value.first': '1',
        'nested.value.second': '2',
        nested: {
          'SOME_VAL': 'YES',
        },

        'no-flag': true,
        TEST_VAL: 1,
      };

      expect(transform.transform(src))
        .toEqual({
          flag: false,
          int: 12,
          nested: {
            someVal: true,
            value: {
              first: 1,
              second: 2,
            },
          },
          testVal: 1,
        });
    });
  });

  it('transformKeyToCamelCase', () => {
    expect(transform.transformKeyToCamelCase('a_val', 1)).toEqual(['aVal', 1]);
    expect(transform.transformKeyToCamelCase('_a_val', 1)).toEqual(['aVal', 1]);
    expect(transform.transformKeyToCamelCase('A', 1)).toEqual(['A', 1]);
  });

  it('transformKeyNegating', () => {
    expect(transform.transformKeyNegating('a', true)).toEqual(['a', true]);
    expect(transform.transformKeyNegating('noA', true)).toEqual(['a', false]);
  });

  it('transformKeyNested', () => {
    expect(transform.transformKeyNested('a.b.c', true)).toEqual(['a', {
      b: { c: true },
    }]);
    expect(transform.transformKeyNested('a', true)).toEqual(['a', true]);
  });

  it('transformKeyToLower', () => {
    expect(transform.transformKeyToLowerCase('A', true)).toEqual(['a', true]);
  });

  describe('processParams', () => {
    it('should accept an empty object', () => {
      expect(transform.processParams(null, { a: { default: 2 } }))
        .toEqual({ a: 2 });
    });

    it('should set default values', () => {
      expect(transform.processParams({}, { a: { default: 2 } }))
        .toEqual({ a: 2 });
    });

    it('should convert types', () => {
      expect(transform.processParams({ a: '1', b: '2', c: 'y', d: '2' }, {
        a: { type: 'string' },
        b: { type: 'number' },
        c: { type: 'boolean' },
        d: { type: 'boolean' },
      }))
        .toEqual({ a: '1', b: 2, c: true, d: false });
    });

    it('should convert aliases', () => {
      expect(transform.processParams({ a: '1', b: '2', c: 'y', d: '2' }, {
        'first.a': { alias: 'a', type: 'number' },
        'first.b': { alias: 'b' },
        second: { alias: 'c' },
        third: { alias: 'd', type: 'boolean' },
      }))
        .toEqual({ first: { a: 1, b: '2' }, second: 'y', third: false });
    });
  });

  it('transformValuePrimitives', () => {
    expect(transform.transformValuePrimitives('a', 'a')).toEqual(['a', 'a']);
    expect(transform.transformValuePrimitives('a', '1')).toEqual(['a', 1]);
    expect(transform.transformValuePrimitives('a', '1.2')).toEqual(['a', 1.2]);
    expect(transform.transformValuePrimitives('a', 'yes')).toEqual(['a', true]);
    expect(transform.transformValuePrimitives('a', 'YES')).toEqual(['a', true]);
    expect(transform.transformValuePrimitives('a', 'FALSE'))
      .toEqual(['a', false]);
  });
});
