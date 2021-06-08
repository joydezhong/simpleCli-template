
const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const validateProjectName = require('validate-npm-package-name');
const TEMPLATE_ENUM = require("./templateEnum.json");
const Creator = require('./Creator');
const { pauseSpinner } = require('../utils/spinner');

const createTemplate = async (templateName, options) => {
  const templateGitRepo = TEMPLATE_ENUM[templateName];
  if (!templateGitRepo) {
    console.log(`   ${chalk.red(`不存在的模板类型 -> ${templateName}`)}`);
    program.outputHelp();
    return ;
  }

  const cwd = process.cwd();

  // 当前项目名称
  const name = path.relative('../', cwd);

  // 在当前目录中运行
  const targetDir = path.resolve(cwd, '.');

  const validateResult = validateProjectName(name);

  if (!validateResult.validForNewPackages) {
    console.error(chalk.red('错误的项目名称: ' + name));
    validateResult.errors && validateResult.errors.forEach(error => {
      console.error(chalk.red.dim(`Error: ${error}`));
    });
    validateResult.warnings &&
      validateResult.warnings.forEach(warn => {
        console.error(chalk.red.dim(`Warning: ${warn}`));
      });
    process.exit(1);
  }

  // 判断当前目录是否为空目录
  const result = fs.readdirSync(targetDir)
  if (result.length) {
    console.error(chalk.red('当前目录不为空, 请创建一个新的空目录!'));
    process.exit(1);
  }

  process.env.NODE_ECHO_CLI_TEMPLATE_NAME = templateName;

  const creator = new Creator(name, targetDir);
  await creator.create(options);

}

module.exports = (templateName, ...args) => {
  return createTemplate(templateName, ...args).catch(err => {
    pauseSpinner();
    console.error(err);
    process.exit(1);
  })
}