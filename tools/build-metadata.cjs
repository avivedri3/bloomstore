const { readFileSync } = require('fs');
const { join } = require('path');

function getPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    return pkg.version || '1.0.0';
  } catch {
    return process.env.APP_VERSION || '1.0.0';
  }
}

function getBuildDate() {
  return process.env.BUILD_DATE || new Date().toISOString();
}

module.exports = { getPackageVersion, getBuildDate };
