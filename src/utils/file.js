'use strict';

const fs   = require('fs');
const path = require('path');

module.exports = {
  findProjectRoot,
  readProjectFile,
};

/**
 * @param {string} searchPath
 * @return {string | undefined}
 */
function findProjectRoot(searchPath = process.cwd()) {
  const filePath = findUp('package.json', searchPath);
  if (filePath) {
    return path.dirname(filePath);
  }
}

function findUp(fileName, cwd = process.cwd()) {
  if (path.isAbsolute(fileName) && fs.existsSync(fileName)) {
    return path.resolve(fileName);
  }

  let currentPath = cwd;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { root, dir } = path.parse(currentPath);

    if (fs.existsSync(path.join(currentPath, fileName))) {
      return path.resolve(path.join(currentPath, fileName));
    }

    if (currentPath === root) {
      return;
    }

    currentPath = dir;
  }
}

function readFile(filePath) {
  const extension = path.extname(filePath);
  try {
    switch (extension) {
      case '.js':
      case '.ts': {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        return require(filePath);
      }

      default: {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }
  } catch (e) {
    return {};
  }
}

function readProjectFile(fileName, cwd = process.cwd()) {
  const filePath = findUp(fileName, cwd);
  if (!filePath) {
    return {};
  }

  const content = readFile(filePath);
  if (Object.keys(content).length > 0) {
    // eslint-disable-next-line no-underscore-dangle
    content.__filename = filePath;
  }

  return content;
}
