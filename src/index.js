'use strict';

/* eslint-disable no-underscore-dangle */

const { getInstance } = require('./registry');

delete require.cache[__filename];
module.exports = getInstance(module && module.parent && module.parent.filename);
module.exports.default = module.exports;
