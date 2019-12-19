'use strict';

module.exports = {
  parseCmdArgs,
};

/**
 * Transform process.argv to key-value object
 * @param {string[]} [argv]
 * @param {Set<string>} [booleans]
 * @return {{_: string[]} & Object<string, string | boolean>}
 */
function parseCmdArgs(argv = process.argv.slice(2), booleans = new Set([])) {
  let key;
  return argv.reduce((flags, arg) => {
    // -k, --key, --key=value
    if (arg[0] === '-') {
      key = arg.replace(/^-+/, '');

      // -kv
      if (arg[1] && arg[1] !== '-' && arg.length > 2 && arg[2] !== '=') {
        const keys = key.split('');
        keys.forEach(k => flags[k] = flags[k] || true);
        key = keys[keys.length - 1];
        return flags;
      }

      // --key=value
      if (key.indexOf('=') > 0) {
        const [k, v] = key.split('=', 2).map(s => s.trim());
        key = null;
        return { ...flags, [k]: v };
      }

      if (booleans.has(key)) {
        flags[key] = true;
        key = null;
        return flags;
      }

      return { ...flags, [key]: flags[key] || true };
    }

    // if last arg was a key, add a value to it
    if (key) {
      if (!flags[key] || flags[key] === true) {
        flags[key] = arg.trim();
      } else {
        flags[key] = [].concat(flags[key]).concat(arg.trim());
      }

      key = null;
    // or just push anonymous arg
    } else {
      flags._.push(arg.trim());
    }

    return flags;
  }, { _: [] });
}
