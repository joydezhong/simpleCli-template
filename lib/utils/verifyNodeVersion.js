const semver = require('semver');
const chalk = require('chalk');

function verifyNodeVersion(target, cliname) {
  if(!semver.satisfies(process.version, target)) {
    console.log(
      chalk.red(
        `You are using Node ${process.version} 
        but this version of ${cliName} requires Node ${target}.\n
        Please upgrade your Node version :) !
        `
      )
    )
  }
}

module.exports = verifyNodeVersion;