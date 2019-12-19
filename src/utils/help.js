'use strict';

module.exports = {
  extractParam,
  formatHelp,
  normalizeIndent,
  parseHelp,
  parseText,
  separateNameAndAlias,
};

const TYPE_ALIASES = {
  bool: 'boolean',
  int: 'number',
  num: 'number',
  str: 'string',
};

function extractParam(text) {
  if (!text.startsWith('-')) {
    return;
  }

  const [_, name1, name2, type] = text.match(
    /(-[\w.-]+),?\s*(-[\w.-]+)?=?\s*(bool|boolean|int|num|number|str|string)?/i
  ) || [];

  if (!name1) {
    return;
  }

  const param = separateNameAndAlias(name1, name2);
  if (type) {
    param.type = type.toLowerCase();
    if (TYPE_ALIASES[param.type]) {
      param.type = TYPE_ALIASES[param.type];
    }
  }

  return param;
}

function formatHelp(lines, options) {
  const text = lines.reduce((result, line) => {
    const indent = line.indent + (options.paddingLeft || 0);
    result.push(' '.repeat(indent) + line.text);
    return result;
  }, []);

  return '\n'.repeat(options.paddingTop || 0)
    + text.join('\n')
    + '\n'.repeat(options.paddingBottom || 0);
}

function normalizeIndent(lines) {
  const minIndent = lines.reduce((min, line) => Math.min(min, line.indent), 80);
  lines.forEach(line => line.indent -= minIndent);
  return lines;
}

function parseHelp(text, options = {}) {
  const lines = parseText(text);

  normalizeIndent(lines);
  const params = lines.reduce((result, line) => {
    const param = extractParam(line.text);
    if (param) {
      result[param.name] = param;
      delete param.name;
    }

    return result;
  }, {});

  return {
    params,
    text: formatHelp(lines, options),
  };
}

function parseText(text) {
  const lines = text.split('\n')
    .map((line) => {
      let indent = 0;
      line.replace(/^\s+/, m => indent += m.length);
      return {
        text: line.trim(),
        indent,
      };
    });

  while (lines[0] && !lines[0].text) {
    lines.shift();
  }

  while (lines[lines.length - 1] && !lines[lines.length - 1].text) {
    lines.pop();
  }

  return lines;
}

function separateNameAndAlias(rawName1, rawName2) {
  const name1 = rawName1 && rawName1.replace(/^-*/, '');
  const name2 = rawName2 && rawName2.replace(/^-*/, '');
  const dashes1 = rawName1 && rawName1.search(/[^-]/);
  const dashes2 = rawName1 && rawName1.search(/[^-]/);


  if (!name2) {
    return { name: name1 };
  }

  if (dashes1 > dashes2) {
    return { name: name1, alias: name2 };
  }

  if (dashes2 > dashes1) {
    return { name: name2, alias: name1 };
  }

  if (name1.length > name2.length) {
    return { name: name1, alias: name2 };
  }

  return { name: name2, alias: name1 };
}
