# weapp-pandacss

[![codecov](https://codecov.io/gh/sonofmagic/weapp-pandacss/branch/main/graph/badge.svg?token=vnU71Pxj3P)](https://codecov.io/gh/sonofmagic/weapp-pandacss)

- [weapp-pandacss](#weapp-pandacss)
  - [介绍](#介绍)
  - [快速开始](#快速开始)
    - [panda css 安装和配置](#panda-css-安装和配置)
    - [weapp-pandacss 配置](#weapp-pandacss-配置)
  - [跨平台注意事项](#跨平台注意事项)
  - [配置项](#配置项)
  - [参考项目](#参考项目)
  - [Bugs \& Issues](#bugs--issues)

## 介绍

[`panda css`](https://panda-css.com/) 是个优秀的 `CSS-in-JS` 编译时框架，原子化和 `[jt]sx?` 文件相结合的写法灵活而又令我犹如沐浴春风，尤其是它的提取器令我印象深刻。

而 `weapp-pandacss` 就是让你在小程序开发中使用它。

## 快速开始

### panda css 安装和配置

首先我们需要把 `@pandacss/dev` 这些都安装和配置好:

```bash
npm install -D @pandacss/dev weapp-pandacss # 或者 yarn / pnpm
npx panda init
```

接着你按照 `panda css` 的安装教程，按照你不同的框架走一遍: <https://panda-css.com/docs/installation/postcss>

配置好了之后，此时 `h5` 平台已经生效了，接下来进入 `weapp-pandacss` 的插件配置，不用担心，也非常简单。

### weapp-pandacss 配置

在项目根目录的 `postcss.config.cjs` 添加 `weapp-pandacss` 以下配置:

```diff
module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {},
+   'weapp-pandacss/postcss': {}
  }
}
```

然后去 `package.json` 你添加 `prepare` 脚本的地方，加点代码

```diff
{
  "scripts": {
-    "prepare": "panda codegen",
+    "prepare": "panda codegen && weapp-panda codegen",
  }
}
```

> 注意这里必须用 `&&` 而不能用 `&`，`&` 任务执行会并行不会等待，而 `&&` 会等待前一个执行完成再执行后一条命令

然后，你再手动执行一下 `npm run prepare`, 重新生成 `styled-system`，`panda css` 就兼容小程序平台啦，是不是很简单?

## 跨平台注意事项

你可能同时开发 `小程序` 和 `h5` 平台，但是你发现使用 `weapp-pandacss` 之后，`h5` 平台似乎就不行了？

这时候你可以这样配置：

`process.env.TARO_ENV === 'h5'` 的时候，不去加载 `weapp-pandacss/postcss` (根据环境变量动态加载 `postcss` 插件)

同时你也可以执行 `weapp-panda rollback` 把 `css` 方法进行回滚到最原始的状态。

当然你恢复到小程序版本也只需要 `weapp-panda codegen`

## 配置项

详见 [types](./src//types.ts)

## 参考项目

[Taro-app](./examples/taro-app)

[Uni-app vue3 vite](./examples/uni-app-vue3/)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-pandacss/issues)
