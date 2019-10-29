'use strict';

const { describe, expect, it } = require('humile');
const { parseCmdArgs }         = require('../cmd');

describe('utils/cmd', () => {
  it('should parse short named arguments', () => {
    expect(parseCmdArgs(['-a', '1', '-b', '2'])).toEqual({
      _: [],
      a: '1',
      b: '2',
    });
  });

  it('should parse argument separated by equals sign', () => {
    expect(parseCmdArgs(['--a=1', '-b=2'])).toEqual({
      _: [],
      a: '1',
      b: '2',
    });
  });

  it('should parse argument separated by space', () => {
    expect(parseCmdArgs(['--a', '1', '-b', '2'])).toEqual({
      _: [],
      a: '1',
      b: '2',
    });
  });

  it('should parse flag arguments', () => {
    expect(parseCmdArgs(['-a', '-b'])).toEqual({
      _: [],
      a: true,
      b: true,
    });
  });

  it('should parse concatenated boolean flags', () => {
    expect(parseCmdArgs(['-ab'])).toEqual({
      _: [],
      a: true,
      b: true,
    });
  });

  it('should parse concatenated flags ', () => {
    expect(parseCmdArgs(['-ab', 'test'])).toEqual({
      _: [],
      a: true,
      b: 'test',
    });
  });

  it('should parse anonymous arguments', () => {
    expect(parseCmdArgs(['a=1', 'b'])).toEqual({
      _: ['a=1', 'b'],
    });
  });

  it('should parse mixed arguments', () => {
    expect(parseCmdArgs(['-a', '-b', '-c', '1', 'd'])).toEqual({
      _: ['d'],
      a: true,
      b: true,
      c: '1',
    });
  });

  it('should parse array arguments', () => {
    expect(parseCmdArgs(['-a', '1', '-a', '2', 'b'])).toEqual({
      _: ['b'],
      a: ['1', '2'],
    });
  });
});
