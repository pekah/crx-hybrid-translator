必应词典+
=========

<a target="_blank" href="https://chrome.google.com/webstore/detail/kkgcfdmlnfpdjmnheeojdlgpmhaeekga">![Try it now in CWS](https://raw.githubusercontent.com/Crimx/BingDictPlus/master/assets/images/tryitnow.png "Click here to install this sample from the Chrome Web Store")</a>

做了个小 chrome 扩展来学习 jQuery！

必应词典对专业词汇翻译的准确度不错，所以弄到 chrome 上，这样在其它平台也可以用啦。

样子跟必应词典的划译基本一样，支持词典与机器翻译。

![必应词典+](https://raw.githubusercontent.com/Crimx/BingDictPlus/master/assets/Web%20Store/%E6%BB%9A%E5%8A%A8%E5%9B%BE%E7%89%87.png)

版本
----

2.0.2

开发
----

- 安装 [node.js](http://nodejs.org/) 和 [npm](https://www.npmjs.org/)
- 全局安装 [grunt-cli](http://gruntjs.com/getting-started) `npm install -g grunt-cli`
- 根目录运行 `grunt`
- Chrome 加载 `/build/dev/`
- 在 `/src/` 下开发

发布
----

- 修改 `_config-grunt.yml` 旧版本号、新版本号
- 根目录运行 `grunt release` 会发布新版本在 `/build/release/`
