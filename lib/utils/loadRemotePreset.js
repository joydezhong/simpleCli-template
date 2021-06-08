const fs = require('fs-extra');

module.exports = async function fetchRemotePreset(name, clone = false) {
  const os = require('os');
  const path = require('path');
  const download = require('./gitDownloadRepo');
  // 生成临时目录, 方便后续中间件对其抓取下来的模板进行处理
  const tmpdir = path.resolve(os.tmpdir(), 'node-echo');

  // 将临时目录的内容先清空， 否则无法写入正常的拉取后的文件
  await fs.remove(tmpdir);
  
  return new Promise((resolve, reject) => {
    download(name, tmpdir, { clone }, err => {
      if (err) {
        return reject(err);
      }
      return resolve(tmpdir);
    });
  });
};