'use strict';

/**
 * Stores one instance per package. So when package-options is required
 * by several different packages, each one will receive its own instance.
 */

const PackageOptions      = require('./PackageOptions');
const { readProjectFile } = require('./utils/file');

module.exports = {
  getInstance,
};

const registry = {};

function getInstance(packageFilePath) {
  if (!packageFilePath) {
    return new PackageOptions();
  }

  const packageJson = readProjectFile('package.json', packageFilePath);
  const { name, version } = packageJson;

  if (name) {
    registry[name] = registry[name] || new PackageOptions({}, {
      name,
      version,
    });
    return registry[name];
  }

  return new PackageOptions();
}
