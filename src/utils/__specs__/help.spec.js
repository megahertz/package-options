'use strict';

const { describe, expect, it } = require('humile');
const help                     = require('../help');

describe('utils/help', () => {
  it('extractParam', () => {
    expect(help.extractParam('-c --count NUMBER How many times')).toEqual({
      alias: 'c',
      name: 'count',
      type: 'number',
    });

    expect(help.extractParam('--count,  -c   string How many times')).toEqual({
      alias: 'c',
      name: 'count',
      type: 'string',
    });

    expect(help.extractParam('--log.count,  -c')).toEqual({
      alias: 'c',
      name: 'log.count',
    });

    expect(help.extractParam('--logCount,  -c')).toEqual({
      alias: 'c',
      name: 'logCount',
    });
  });

  it('formatHelp', () => {
    const lines = [
      { text: 'Usage: mycmd [options]', indent: 0 },
      { text: 'Options:', indent: 2 },
      { text: '-f, --file FILE', indent: 4 },
    ];

    expect(help.formatHelp(lines, { paddingTop: 1, paddingLeft: 2 })).toBe([
      '',
      '  Usage: mycmd [options]',
      '    Options:',
      '      -f, --file FILE',
    ].join('\n'));
  });

  it('normalizeIndent', () => {
    const lines = [
      { indent: 2 },
      { indent: 4 },
    ];

    expect(help.normalizeIndent(lines)).toEqual([
      { indent: 0 },
      { indent: 2 },
    ]);
  });

  it('parseText', () => {
    expect(help.parseText(`
    
      line1
      line2
      
    line3
line4
    
    `)).toEqual([
      { text: 'line1', indent: 6 },
      { text: 'line2', indent: 6 },
      { text: '', indent: 6 },
      { text: 'line3', indent: 4 },
      { text: 'line4', indent: 0 },
    ]);
  });

  it('parseHelp', () => {
    const src = `
      Usage: cat [OPTION]... [FILE]...
      Concatenate FILE(s) to standard output.
      
      With no FILE, or when FILE is -, read standard input.
      
        -A, --show-all           equivalent to -vET
        -b, --number-nonblank    number nonempty output lines, overrides -n
        -e                       equivalent to -vE
        -E, --show-ends          display $ at end of each line
        -n, --number             number all output lines
        -s, --squeeze-blank      suppress repeated empty output lines
        -t                       equivalent to -vT
        -T, --show-tabs          display TAB characters as ^I
        -u                       (ignored)
        -v, --show-nonprinting   use ^ and M- notation, except for LFD and TAB
            --help     display this help and exit
            --version  output version information and exit
      
      Examples:
        cat f - g  Output f's contents, then standard input, then g's contents.
        cat        Copy standard input to standard output.
      
      GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
      Full documentation <https://www.gnu.org/software/coreutils/cat>
      or available locally via: info '(coreutils) cat invocation'
    `;

    const text = [
      'Usage: cat [OPTION]... [FILE]...',
      'Concatenate FILE(s) to standard output.',
      '',
      'With no FILE, or when FILE is -, read standard input.',
      '',
      '  -A, --show-all           equivalent to -vET',
      '  -b, --number-nonblank    number nonempty output lines, overrides -n',
      '  -e                       equivalent to -vE',
      '  -E, --show-ends          display $ at end of each line',
      '  -n, --number             number all output lines',
      '  -s, --squeeze-blank      suppress repeated empty output lines',
      '  -t                       equivalent to -vT',
      '  -T, --show-tabs          display TAB characters as ^I',
      '  -u                       (ignored)',
      '  -v, --show-nonprinting   use ^ and M- notation, except for LFD '
      + 'and TAB',
      '      --help     display this help and exit',
      '      --version  output version information and exit',
      '',
      'Examples:',
      '  cat f - g  Output f\'s contents, then standard input, then '
      + 'g\'s contents.',
      '  cat        Copy standard input to standard output.',
      '',
      'GNU coreutils online help: <https://www.gnu.org/software/coreutils/>',
      'Full documentation <https://www.gnu.org/software/coreutils/cat>',
      'or available locally via: info \'(coreutils) cat invocation\'',
    ].join('\n');

    expect(help.parseHelp(src)).toEqual({
      text,
      params: {
        'number-nonblank': { alias: 'b', type: 'number' },
        'show-all': { alias: 'A' },
        'e': {},
        'show-ends': { alias: 'E' },
        'number': { alias: 'n', type: 'number' },
        'squeeze-blank': { alias: 's' },
        't': {},
        'show-tabs': { alias: 'T' },
        'u': {},
        'show-nonprinting': { alias: 'v' },
        'help': {},
        'version': {},
      },
    });
  });

  it('separateNameAndAlias', () => {
    expect(help.separateNameAndAlias('-n', '--name')).toEqual({
      name: 'name',
      alias: 'n',
    });

    expect(help.separateNameAndAlias('--name', '-n')).toEqual({
      name: 'name',
      alias: 'n',
    });

    expect(help.separateNameAndAlias('-name', '-n')).toEqual({
      name: 'name',
      alias: 'n',
    });
  });
});
