const EventEmitter = require("events");
const chalk = require("chalk");
const fs = require("fs-extra");
const execa = require("execa"); // child_process 封装库
const path = require('path')

const { clearConsole } = require("../utils/clearConsole");
const { log, warn, error } = require("../utils/logger");
const { logWithSpinner, stopSpinner } = require("../utils/spinner");
const { hasGit, hasProjectGit } = require("../utils/env");
const fetchRemotePreset = require('../utils/loadRemotePreset');
const TEMPLATE_ENUM = require("./templateEnum.json");

class Creator extends EventEmitter {
  constructor(name, context){
    super();
    this.name = name;
    this.context = process.env.NODE_ECHO_CLI_CONTEXT = context;
  }

  async create(cliOptions = {}) {
    const { name, context } = this
    const gitRepo = TEMPLATE_ENUM[process.env.NODE_ECHO_CLI_TEMPLATE_NAME];

    let tmpdir;

    await clearConsole(true);

    log(`✨ Creating project in ${chalk.yellow(context)}.`);
    log();

    try {
      stopSpinner();
      logWithSpinner(`⠋`, `下载模板中, 请稍候...`);
      tmpdir = await fetchRemotePreset(gitRepo["download"]);
    } catch (e) {
      stopSpinner();
      error(`擦， 下载失败 ${chalk.cyan(gitRepo)}:`);
      throw e;
    }
    console.log(tmpdir)
    // 将接收的模板文件 传入到目标目录中
    try {
      fs.copySync(tmpdir, context, {
        filter: (src, dest) => {
          return path.basename(src, '.git') !== gitRepo.repoName
        }
      });
    } catch (error) {
      return console.error(chalk.red.dim(`Error: ${error}`));
    }

    const shouldInitGit = this.shouldInitGit();

    if (shouldInitGit) {
      // 已经安装git
      stopSpinner();
      log();
      logWithSpinner(`🗃`, `Initializing git repository...`);
      this.emit("creation", { event: "git-init" });
      // 执行git init
      await this.run("git init");
    }

    // commit init state
    let gitCommitFailed = false;
    if (shouldInitGit) {
      await this.run("git add -A");
      try {
        await this.run("git", ["commit", "-m", "init"]);
      } catch (error) {
        gitCommitFailed = true;
      }
    }

    stopSpinner();
    log();
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`);
    log();
    this.emit("creation", { event: "done" });
    if (gitCommitFailed) {
      // commit fail
      warn(
        `Skipped git commit due to missing username and email in git config.\n` +
          `You will need to perform the initial commit yourself.\n`
      );
    }
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }

  shouldInitGit() {
    if (!hasGit()) {
      return false;
    }
    return !hasProjectGit(this.context);
  }

}

module.exports = Creator;