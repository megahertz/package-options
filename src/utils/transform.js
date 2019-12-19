'use strict';

const { deepMap, getNode, setNode } = require('./object');

module.exports = {
  camelCaseToSnake,
  processParams,
  transform,
  transformKeyNegating,
  transformKeyNested,
  transformKeyToCamelCase,
  transformKeyToLowerCase,
  transformValuePrimitives,
};

const PRIMITIVES_MAP = {
  false: false,
  no: false,
  true: true,
  yes: true,
};

const TRANSFORMS = [
  'keyToLowerCase',
  'keyToCamelCase',
  'keyNegating',
  'keyNested',
  'valuePrimitives',
];

const TRANSFORMS_MAP = TRANSFORMS.reduce((result, name) => {
  const transformer = 'transform' + name[0].toUpperCase() + name.slice(1);
  result[name] = module.exports[transformer];
  return result;
}, {});

function camelCaseToSnake(src) {
  return src.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function processParams(object, params) {
  object = object || {};

  Object.entries(params).forEach(([name, opts]) => {
    if (!name || !name.split) {
      return;
    }

    let value = getNode(object, name);
    if (value === undefined && opts.alias) {
      value = object[opts.alias];
    }

    if (opts.type) {
      value = toType(value, opts.type, name);
    }

    if (value === undefined) {
      value = opts.default;
    }

    object = setNode(object, name, value);

    if (opts.alias && typeof object[opts.alias] !== 'object') {
      delete object[opts.alias];
    }
  });

  return object;
}

function snakeCaseToCamel(src) {
  const camel = src.replace(/[-_]([a-z])/gi, m => m[1].toUpperCase());
  return camel[0].toLowerCase() + camel.substr(1);
}

function toType(value, type, name) {
  if (value === undefined || value === null) {
    return value;
  }

  switch (type) {
    case 'string': return '' + value;
    case 'number': return Number(value);
    case 'boolean': {
      if (value === true || value === '1' || value === 1) {
        return true;
      }

      if (value.toLowerCase) {
        const lc = value.toLowerCase();
        return lc === 'true' || lc.charAt(0) === 'y';
      }

      return false;
    }
    default: throw new Error(`Unknown type '${type}' of param '${name}'`);
  }
}

function transform(object, transforms = {}) {
  return TRANSFORMS
    .filter(t => transforms[t] !== false)
    .map(t => TRANSFORMS_MAP[t])
    .reduce((obj, t) => deepMap(obj, t), object);
}

function transformKeyNegating(key, value) {
  if (key.match(/^no[A-Z]/)) {
    key = key[2].toLowerCase() + key.substr(3);
    value = false;
  }

  return [key, value];
}

function transformKeyNested(key, value) {
  if (key.includes('.')) {
    const [rootKey, ...subKeys] = key.split('.');
    return [rootKey, setNode({}, subKeys.join('.'), value)];
  }

  return [key, value];
}

function transformKeyToCamelCase(key, value) {
  if (key.length > 1) {
    return [snakeCaseToCamel(key), value];
  }

  return [key, value];
}

function transformKeyToLowerCase(key, value) {
  return [key.toLowerCase(), value];
}

function transformValuePrimitives(key, value) {
  if (!value || !value.toLowerCase) {
    return [key, value];
  }

  const normalized = value.trim ? value.trim().toLowerCase() : value;

  if (PRIMITIVES_MAP[normalized] !== undefined) {
    value = PRIMITIVES_MAP[normalized];
  }

  if (normalized && !Number.isNaN(+normalized)) {
    value = +normalized;
  }

  return [key, value];
}
