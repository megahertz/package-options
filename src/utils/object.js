'use strict';

/* eslint-disable no-sequences */

module.exports = {
  deepCopy,
  deepMap,
  deepMerge,
  filterByKeyPrefix,
  filterByKeys,
  getNode,
  setNode,
};

function createCircularReplacer() {
  const seen = new WeakSet();

  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }

      seen.add(value);
    }

    return value;
  };
}

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object, createCircularReplacer()));
}

function deepMap(object, callback) {
  const result = Array.isArray(object) ? [] : {};

  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
      continue;
    }

    let value = object[key];

    if (typeof value === 'object') {
      value = deepMap(value, callback);
    }

    const [newKey, newValue] = callback(key, value, object);

    if (typeof result[newKey] === 'object' && typeof newValue === 'object') {
      result[newKey] = deepMerge(result[newKey], newValue);
    } else {
      result[newKey] = newValue;
    }
  }

  return result;
}

function deepMerge(target, ...sources) {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }

      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }

        deepMerge(target[key], source[key]);
      } else if (source[key] !== undefined) {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function filterByKeyPrefix(object, prefix) {
  if (!prefix || !prefix.toLowerCase) {
    return object;
  }

  prefix = prefix.toLowerCase();

  return Object.keys(object)
    .filter(key => key.toLowerCase().startsWith(prefix))
    .reduce((res, key) => {
      let newKey = key.substr(prefix.length);
      if (newKey[0] === '_' || newKey[0] === '-') {
        newKey = newKey.substr(1);
      }

      res[newKey] = object[key];
      return res;
    }, {});
}

function filterByKeys(object, keys) {
  if (!Array.isArray(keys)) {
    return object;
  }

  keys = keys.map(k => k.toLowerCase());

  return Object.entries(object).reduce((res, [key, value]) => {
    if (!keys.includes(key.toLowerCase())) {
      return res;
    }

    res[key] = value;
    return res;
  }, {});
}

function getNode(object, path, defaultValue = undefined) {
  if (!path || !path.split || !object) {
    return defaultValue;
  }

  let node = object;
  for (const name of path.split('.')) {
    if (!Object.prototype.propertyIsEnumerable.call(node, name)) {
      return defaultValue;
    }

    node = node[name];

    if (typeof node !== 'object') break;
  }

  return node === undefined ? defaultValue : node;
}

function isObject(object) {
  return (object && typeof object === 'object' && !Array.isArray(object));
}

function setNode(object, path, value) {
  if (!path || !path.split) {
    return;
  }

  object = object && typeof object === 'object' ? object : {};

  const keys = path.split('.');
  let node = object;
  for (let i = 0; i < keys.length - 1; i++) {
    const name = keys[i];

    if (typeof node[name] !== 'object') {
      node[name] = {};
    }

    node = node[name];
  }

  node[keys[keys.length - 1]] = value;

  return object;
}
