#! /usr/bin/env node

const program = require('commander'); // 命令行工具
const argv = require('argv'),
    echo = require('../lib/echo');
const inquirer = require('inquirer');
const verifyNodeVersion = require('../lib/utils/verifyNodeVersion');
const TEMPLATE_ENUM = require('../lib/template/templateEnum.json');
const { engines, name, version } = require('../package.json');
const createTemplate = require('../lib/template/createTemplate');

/** 校验所需node版本 */
verifyNodeVersion(engines.node, name);

program.version(version, '-v, --version') // 输出版本信息
.usage('<command> [options]') // 如何使用

program.command('create')
.description('创建一个项目模板')
.action(async (cmd) => {
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '选择要使用的模板',
      choices: Object.keys(TEMPLATE_ENUM)
    }
  ])
  createTemplate(template)
})

program.parse(process.argv); // 把命令行参数传给commander解析
    
console.log(echo(argv.run().targets.join(' ')));