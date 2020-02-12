'use strict';

const { describe, expect, it } = require('humile');
const object                   = require('../object');

describe('utils/object', () => {
  describe('deepCopy', () => {
    it('should produce deep copy', () => {
      const src = { a: { b: 'original' } };
      const dest = object.deepCopy(src);
      dest.a.b = 'modified';

      expect(src.a.b).toBe('original');
      expect(dest.a.b).toBe('modified');
    });

    it('should remove cycle references', () => {
      const src = { a: { b: 1 } };
      src.c = src;
      const dest = object.deepCopy(src);

      expect(dest).toEqual({
        a: { b: 1 },
      });
    });
  });

  describe('deepMap', () => {
    function toUpperCase(key, val) {
      return [key.toUpperCase(), val.toUpperCase ? val.toUpperCase() : val];
    }

    it('should transform valid object', () => {
      const src = { a: { b: 'original' } };
      const dest = object.deepMap(src, toUpperCase);

      expect(src.a.b).toBe('original');
      expect(dest.A.B).toBe('ORIGINAL');
    });

    it('should return an empty object on wrong input', () => {
      const src = { a: { b: 'original' } };
      const dest = object.deepMap(null, toUpperCase);

      expect(src.a.b).toBe('original');
      expect(dest).toEqual({});
    });
  });

  describe('deepMerge', () => {
    it('should merge simple object', () => {
      const target = { a: { c: 2 } };
      const src = { a: { b: 'original' } };

      expect(object.deepMerge(target, src))
        .toEqual({ a: { b: 'original', c: 2 } });
      expect(src).toEqual({ a: { b: 'original' } });
    });

    it('should merge array values', () => {
      const target = { a: [1] };
      const src = { a: [2] };

      expect(object.deepMerge(target, src))
        .toEqual({ a: [2] });
    });

    it('should merge undefined values correctly', () => {
      const target = { a: 1 };
      const src = { a: undefined };

      expect(object.deepMerge(target, src))
        .toEqual({ a: 1 });
    });
  });

  it('filterByKeyPrefix', () => {
    const src = {
      SOME_VAL: 1,
      MY_VAL: 2,
      my_val2: 3,
    };

    expect(object.filterByKeyPrefix(src, 'my')).toEqual({
      VAL: 2,
      val2: 3,
    });
  });

  it('filterByKeys', () => {
    const src = {
      SOME_VAL: 1,
      MY_VAL: 2,
      my_val2: 3,
    };

    expect(object.filterByKeys(src, ['some_val', 'MY_VAL'])).toEqual({
      SOME_VAL: 1,
      MY_VAL: 2,
    });
  });


  describe('getNode', () => {
    it('should return a nested value', () => {
      const src = { a: { b: 'original' } };

      expect(object.getNode(src, 'a.b')).toBe('original');
      expect(object.getNode(src, 'a.c', false)).toBe(false);
    });

    it('should return a default value if object is null', () => {
      const src = { a: { b: 'original' } };

      expect(object.getNode(null, 'a.b', false)).toBe(false);
    });
  });

  describe('setNode', () => {
    it('should set node of a normal object', () => {
      const src = { a: { b: 'original' } };

      object.setNode(src, 'a.b', 'modified');
      object.setNode(src, 'c.d', 1);

      expect(src.a.b).toBe('modified');
      expect(src.c.d).toBe(1);
    });

    it('should create a new object if an empty object passed', () => {
      expect(object.setNode(null, 'a', 1)).toEqual({ a: 1 });
    });
  });
});
