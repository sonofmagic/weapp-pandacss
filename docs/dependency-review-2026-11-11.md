# 依赖升级与 Panda 兼容验收（2026-11-11）

本轮覆盖根工具链、两个发布包、Nimbus 文档站和五个活动示例；`examples/taro-app-linaria` 继续排除。范围是各框架允许的最新稳定版本，不默认采用预发布版本，也不拆散框架官方编译器版本组。本记录衔接 [2026-10-15 评估](./dependency-review-2026-10-15.md)，旧报告和旧审计基线中的数字属于当时的结果。

## 采用的版本与兼容边界

| 范围                         | 本轮采用                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Panda 工具、preset、公开类型 | 2.5.0；2.1.2 精确别名继续用于最低版本验收                                                                      |
| 适配器                       | Babel 8.1.0、css-compat 0.1.4、local-pkg 2.0.0、unit converter 0.3.0、selector parser 7.2.0                    |
| 根工具链                     | repoctl 6.5.4、tsdown 0.23.7、Vitest 5.1.0、ESLint 10.14.0、Stylelint 18.0.0、Playwright 1.65.0、Turbo 2.11.10 |
| Taro React / Vue             | Taro 官方 4.3.2 同版本组；Babel 7.29.x；Webpack `~5.111.1`                                                     |
| Weapp Vite / Wevu            | 7.9.0；Vue 3.5.45；mpcore test/vitest 1.2.3、weapp-vite 1.1.3                                                  |
| React Web                    | Vite 8.3.8、React plugin 6.3.0，React 19.3.1 保留                                                              |
| Uni-app                      | 官方 `3.0.0-5020620260917001` 编译器组保留；weapp-tailwindcss 5.7.4                                            |
| 文档站                       | Nimbus 0.19.4、Astro 7.4.10、Wrangler 4.160.0、Pagefind 1.6.0                                                  |

完整直接依赖声明与传递依赖见根锁文件。repoctl 管理的技能、workflow 和配置基线通过其 upgrade 工作流同步，没有手工修改受管根配置。Nimbus 的迁移审阅记录见 [UPSTREAM.md](../apps/docs/UPSTREAM.md)。Taro 的两份补丁迁移到 4.3.2；新版 repoctl 已包含原来的工具链修复，移除了 6.0.1 补丁。

私有工作区和文档站使用 Node `^22.23.4 || ^24.22.1 || >=26.12.1`，本轮验证实际使用 `.nvmrc` 的 24.22.1 和 pnpm 12.11.2。发布包保留 `^22.18.0 || >=24.11.0`，不因开发工具升级提高消费者下限。

递归 outdated 保留项的依据：

- TypeScript 保留 6.0.3。7.0.2 的 exports 不再提供 `typescript/lib/tsc`，当前 `vue-tsc@3.3.14` 仍解析该入口；实际运行 7.0.2 peer 组合报 `ERR_PACKAGE_PATH_NOT_EXPORTED`。这需要类型检查工具迁移，不能只更新 catalog。
- Taro 继续使用 React 18、Babel 7、Vue Babel JSX plugin 1.x 和 react-refresh 0.14.x。新版 JSX plugin 和 Babel 8 不属于这组框架依赖。
- Webpack 5.112 移动了 Taro 4.3.2 依赖的内部入口，构建失败；固定 5.111 补丁线，原因记录在 repoctl 的 `taro-webpack5` 分组。
- Uni 的 Vite 5.2.8、Vue/runtime/compiler 3.4.21 和 `@dcloudio/types@3.4.31` 都由当前官方版本组精确约束。曾试装 types 3.4.32，安装图 peer 检查明确拒绝，已恢复 3.4.31。DCloud 的旧 alpha dist-tag 不作为升级或降级目标。
- NutUI 的 latest 标签指向 beta，保持最新稳定版本。Panda 2.1.2 别名专用于最低版本测试，不属于漏升级。

Stylelint 18 开始检查旧 Less 括号算术值。五个示例统一改用 `-@space`，保留负 margin 的编译语义与现有产物断言。

PR 的跨平台 CI 发现 Weapp Vite 7.9.0 测试产物指纹会将解析器注册的 Windows 盘符根目录当作源码树递归读取，访问 `D:\System Volume Information` 时失败。`patches/weapp-vite@7.9.0.patch` 将文件系统根目录监听限制为目录成员摘要，显式源码和其他目录继续按内容递归校验。真实构建回归注册根目录监听，验证首次构建、同长度源码改写后的缓存失效和重新生成产物；没有跳过 Windows 集成测试。上游修复后应移除这份版本限定补丁。

## 讨论 #166：最低版本与结构契约

适配器已有的 peer 和运行时门禁接受 `>=2.1.2` 的稳定 Panda，没有版本上限。本轮补齐当前稳定版 2.5.0 的真实打包消费者验收、示例与双语文档。低版本、缺失安装、无效版本和预发布版本仍失败；未来稳定主版本不会仅因版本号被拒绝，生成产物仍需通过 AST 结构检查。

Panda 2.5 的公开配置类型引用 `pkg-types` 和 `exsolve`，声明打包将它们与 `@pandacss/types` 一起内联，避免向消费者泄漏缺失的声明依赖。两个真实消费者还发现 named recipe 的 `variantMap` 选项顺序变化；验收比较完整选项集合，继续检查默认值、选项拆分、实际 class 与 CSS，而不把生成器的排序实现固定为适配器契约。

Node 22.18.0 / 24.11.0 × Panda 2.1.2 / 2.5.0 四格全部通过。每格真实离线安装本地 tarball，以空 metadata cache 验证独立解析，执行 ESM/CJS 入口、公开声明、codegen/cssgen/build、运行时和 PostCSS；各含 8 种模式与 11 个负例。报告位于本地产物 `e2e-artifacts/consumer-acceptance/consumer-report.json`。这证明两个已验收版本，不表示穷举所有未来版本。

## 安全审计与保留项

同日升级前完整审计共 120 项（107 个不同 GHSA），升级后 59 项（59 个不同 GHSA），没有新增 GHSA。按完整 `pnpm audit --json` 统计：

| 等级     | 升级前 | 升级后 |
| -------- | ------ | ------ |
| Low      | 18     | 10     |
| Moderate | 60     | 35     |
| High     | 39     | 11     |
| Critical | 3      | 3      |

`pnpm audit --audit-level=moderate` 因保留项返回 1；它的 advisory 明细不包含 Low，不能用过滤后的明细数量代替上表总数。旧仓库基线记录于 2026-10-15，之后上游新增公告且本轮更新了依赖链版本。`e2e/audit-baseline.json` 现记录本次逐项审阅的完整 GHSA、受影响版本和从锁文件推导的工作区依赖链；没有关闭回归检查或忽略 advisory。

窄范围安全修复包括 Uni/Taro 的 adm-zip 0.5.16/0.5.18 → 0.6.1 与 glob 10.2.6 → 10.5.0。ZIP 回归从三个实际消费包解析依赖，验证压缩读取、同步/异步解压、symlink 逃逸拒绝与伪造输出大小拒绝。既有 Intlify 原型污染与 Express 正则回归继续执行。安全升级没有替换 Uni 官方 Vite/Vue 版本组或强推 Taro 内部依赖跨主版本。

高危与严重项的来源和影响：

| 依赖与版本                                       | 实际来源与影响                                                                        | 保留原因                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| swiper 11.1.15                                   | Taro components / components-react；H5 Swiper 的原型污染                              | 修复版从 12.1.2 起，Taro 精确依赖 11.1.15，需要上游完成运行时主版本迁移 |
| decompress 4.2.1                                 | Taro CLI → download-git-repo → download；不可信归档的路径/链接逃逸                    | 4.2.1 仍为最新版本，无修复版；本仓库构建不执行下载远程模板功能          |
| git-clone 0.1.0                                  | Taro CLI → download-git-repo；不可信仓库参数命令注入                                  | 无修复版；用于 CLI 下载模板链路                                         |
| http-cache-semantics 3.8.1                       | 同一模板下载链的 got/cacheable-request；缓存头 ReDoS                                  | 修复要求 4.x，保留旧下载客户端边界，等待上游升级                        |
| decode-uri-component 0.2.2                       | 同一下载链的 normalize-url/query-string；恶意编码输入 DoS                             | 修复版 0.5.1 改为 ESM，不能直接替换 CJS 消费边界                        |
| html-minifier 4.0.0                              | Taro webpack5 runner；不可信 HTML 的 ReDoS                                            | 上游仍采用旧 API，替换为不同版本或 fork 需独立适配                      |
| serialize-javascript 6.0.2                       | Taro runner 的 copy/css-minimizer 插件；恶意序列化对象可执行代码、耗尽 CPU 或输出 XSS | 修复要求 7.x，未强推插件依赖跨主版本；构建输入为仓库代码                |
| PostCSS 7.0.39                                   | Taro runner → miniprogram-simulate；不可信 CSS 的 source map 文件读取                 | 修复只在 8.x，7.x 最新仍为 7.0.39；不能用全局 override 替换旧插件协议   |
| webpack-dev-middleware 5.3.4 / dev-server 4.15.2 | Taro H5 开发服务器；路径遍历与源码暴露                                                | middleware 修复在 7.x、server 修复在 5.x；需要 runner 联动升级          |
| Vite 5.2.8                                       | Uni 官方编译器组；开发服务器文件读取、Windows editor 命令注入，部分输出存在 XSS       | 官方 plugin peer 精确锁定 5.2.8，不能独立升级                           |
| @vue/server-renderer 3.4.21                      | Uni cli-shared；不可信 SSR 属性名可能造成 XSS                                         | 与 Vue 3.4.21 官方编译器组同步；本例为客户端小程序/H5 构建              |

其余 Low / Moderate 包括旧 Intlify 的插值转义、Express cookie/send 的头与 HTML 输出、旧 got/phin 的重定向、测试工具的 deepmerge/once、工具链 glob/minimatch 的恶意模式或取消边界、KaTeX 的受信任内容以及 uuid buffer 边界。它们的准确版本、工作区来源与修复范围列于下表。部分版本存在修复，但需要替换上游依赖边界；无修复范围的项仍由上游维护。构建成功与安全修复不是同一结论，保留项继续由审计门禁跟踪。

## 验证

| 检查                      | 结果                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| frozen install            | 通过，锁文件与活动 workspace 一致                                                                        |
| repo deps check           | 145 consistent / 2 managed / 3 exception / 0 conflict                                                    |
| repo deps peers           | 2 pass / 0 fail；两个发布包的 peer 承诺与开发依赖相容                                                    |
| repo deps catalog check   | missing / unused / uncomparable / direct 均为 0                                                          |
| repo doctor               | 98 pass / 66 warn / 0 fail；保留模板实例差异等提示                                                       |
| repo check --full         | lint / typecheck / test / build 全部通过                                                                 |
| pnpm validate             | build / lint / typecheck / tsd / test / test:types / docs:test 通过                                      |
| 完整 Vitest               | 37 文件、434 项通过；statements 371/371、branches 334/334、functions 102/102、lines 341/341，四项均 100% |
| pnpm build:examples       | 五个活动示例构建通过，历史 Linaria 不参与                                                                |
| pnpm test:consumer:matrix | 两个最低 Node × 两个 Panda 版本四格通过                                                                  |
| 文档                      | 54 页构建、27 对语言页面检查、Astro/TypeScript 检查和双语首页可执行示例通过                              |
| pnpm change check         | 中文 minor changeset 有效；没有手工增加发布版本                                                          |
| pnpm audit:acceptance     | 完整 59 项保留公告通过已审阅的 GHSA/版本/依赖链基线                                                      |

`pnpm peers check` 仍返回 1：两个 Taro framework 的可选构建路径声明 Vite `^4`，当前实际采用 Webpack；runner/loader/prebundle 精确声明 Webpack 5.91.0，实际验证 5.111.1。Wevu 的 Babel 8 与 polyfill-corejs3/helper 的 Babel 7 peer 也仍不同。没有通过忽略 peer 或改写上游声明隐藏这些提示。lint 保留 Taro React / Uni 的 6 条 console warning，没有错误。

本轮没有执行浏览器或真实微信 IDE 交互；完整 Vitest 的框架构建产物检查不代表真实 IDE 像素验收。没有发布包或部署文档站。原始升级、验证和审计日志位于本机 `/tmp/weapp-pandacss-*-2026-11-11.*`，消费者证据保存在忽略的 artifacts 目录。

## 保留公告逐项记录

工作区缩写：根 = 根工具链，文档 = apps/docs，React / Taro React / Taro Vue / Uni / Wevu = 对应活动示例，适配器 / runtime = 发布包工作区。来源通过实际锁文件图计算，包括工作区的开发依赖；出现在发布包工作区不等于发布 tarball 带入这条依赖。完整父子依赖边见审计基线。

| 公告                                                                     | 等级     | 受影响版本                   | 工作区来源                                                        | 影响                                                                                                                                  | 上游修复范围 |
| ------------------------------------------------------------------------ | -------- | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| [GHSA-hrh2-vp3x-79xf](https://github.com/advisories/GHSA-hrh2-vp3x-79xf) | critical | decompress 4.2.1             | Taro React、Taro Vue                                              | @xhmikosr/decompress: Path traversal via symlink chain                                                                                | 暂无修复范围 |
| [GHSA-mp2f-45pm-3cg9](https://github.com/advisories/GHSA-mp2f-45pm-3cg9) | critical | decompress 4.2.1             | Taro React、Taro Vue                                              | Decompress: Archive extraction can create files and links outside of the target directory                                             | 暂无修复范围 |
| [GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643) | critical | swiper 11.1.15               | Taro React、Taro Vue                                              | Prototype pollution in swiper                                                                                                         | >=12.1.2     |
| [GHSA-g2v6-rqmx-r4w6](https://github.com/advisories/GHSA-g2v6-rqmx-r4w6) | high     | @vue/server-renderer 3.4.21  | Uni                                                               | @vue/server-renderer: XSS via missing CR in attribute-name blacklist                                                                  | >=3.5.42     |
| [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f) | high     | decode-uri-component 0.2.2   | Taro React、Taro Vue                                              | decode-uri-component vulnerable to denial of service via quadratic replacement of percent-encoded runs                                | >=0.5.1      |
| [GHSA-8jmw-wjr8-2x66](https://github.com/advisories/GHSA-8jmw-wjr8-2x66) | high     | git-clone 0.1.0              | Taro React、Taro Vue                                              | Command injection in git-clone                                                                                                        | 暂无修复范围 |
| [GHSA-pfq8-rq6v-vf5m](https://github.com/advisories/GHSA-pfq8-rq6v-vf5m) | high     | html-minifier 4.0.0          | Taro React、Taro Vue                                              | kangax html-minifier REDoS vulnerability                                                                                              | >=5.0.0      |
| [GHSA-rc47-6667-2j5j](https://github.com/advisories/GHSA-rc47-6667-2j5j) | high     | http-cache-semantics 3.8.1   | Taro React、Taro Vue                                              | http-cache-semantics vulnerable to Regular Expression Denial of Service                                                               | >=4.1.1      |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high     | postcss 7.0.39               | Taro React、Taro Vue                                              | PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments                      | >=8.5.12     |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high     | postcss 7.0.39               | Taro React、Taro Vue                                              | PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure                | >=8.5.18     |
| [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq) | high     | serialize-javascript 6.0.2   | Taro React、Taro Vue                                              | Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()                                           | >=7.0.3      |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | high     | vite 5.2.8                   | Uni                                                               | launch-editor: `fs.existsSync()` existence check can be bypassed on Windows                                                           | >=6.4.4      |
| [GHSA-c27g-q93r-2cwf](https://github.com/advisories/GHSA-c27g-q93r-2cwf) | high     | vite 5.2.8                   | Uni                                                               | launch-editor vulnerable to command injection via the crafted request on Windows                                                      | >=5.4.9      |
| [GHSA-g84c-rxfj-3j2c](https://github.com/advisories/GHSA-g84c-rxfj-3j2c) | high     | webpack-dev-middleware 5.3.4 | Taro React、Taro Vue                                              | webpack-dev-middleware vulnerable to Path Traversal via non-slash-terminated publicPath                                               | >=7.4.5      |
| [GHSA-x8qp-wqqm-57ph](https://github.com/advisories/GHSA-x8qp-wqqm-57ph) | moderate | @intlify/core-base 9.1.11    | Uni                                                               | vue-i18n's escapeParameterHtml does not prevent DOM-based XSS through its tag attributes                                              | >=9.14.5     |
| [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | moderate | decode-uri-component 0.2.2   | Taro React、Taro Vue                                              | decode-uri-component: Denial of service via exponential decoding of malformed percent-encoded input                                   | >=0.5.0      |
| [GHSA-h39j-r5qq-r9mm](https://github.com/advisories/GHSA-h39j-r5qq-r9mm) | moderate | decompress 4.2.1             | Taro React、Taro Vue                                              | decompress: Arbitrary File Write via Archive Extraction (Zip Slip)                                                                    | 暂无修复范围 |
| [GHSA-jwp9-9v96-94mx](https://github.com/advisories/GHSA-jwp9-9v96-94mx) | moderate | decompress 4.2.1             | Taro React、Taro Vue                                              | decompress allows arbitrary hardlink creation during archive extraction                                                               | 暂无修复范围 |
| [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | moderate | esbuild 0.20.2 / 0.21.5      | Uni、Taro React、Taro Vue                                         | esbuild enables any website to send any requests to the development server and read the response                                      | >=0.25.0     |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | moderate | glob 10.5.0 / 13.0.7         | 根、文档、React、Taro React、Taro Vue、Uni、Wevu、runtime、适配器 | Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal                                                        | >=14.0.2     |
| [GHSA-pfrx-2q88-qq97](https://github.com/advisories/GHSA-pfrx-2q88-qq97) | moderate | got 8.3.2 / 9.6.0            | Taro React、Taro Vue                                              | Got allows a redirect to a UNIX socket                                                                                                | >=11.8.5     |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | moderate | minimatch 10.2.6 / 9.0.9     | 根、文档、Wevu、React、Taro React、Taro Vue、Uni、runtime、适配器 | minimatch has potential denial of service via globparts amplification                                                                 | >=11.0.1     |
| [GHSA-x565-32qp-m3vf](https://github.com/advisories/GHSA-x565-32qp-m3vf) | moderate | phin 2.9.3                   | 根、Uni                                                           | phin may include sensitive headers in subsequent requests after redirect                                                              | 暂无修复范围 |
| [GHSA-7fh5-64p2-3v2j](https://github.com/advisories/GHSA-7fh5-64p2-3v2j) | moderate | postcss 7.0.39               | Taro React、Taro Vue                                              | PostCSS line return parsing error                                                                                                     | >=8.4.31     |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | moderate | postcss 7.0.39               | Taro React、Taro Vue                                              | PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset | >=8.5.23     |
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | moderate | postcss 7.0.39               | Taro React、Taro Vue                                              | PostCSS has XSS via Unescaped </style> in its CSS Stringify Output                                                                    | >=8.5.10     |
| [GHSA-qj8w-gfj5-8c6v](https://github.com/advisories/GHSA-qj8w-gfj5-8c6v) | moderate | serialize-javascript 6.0.2   | Taro React、Taro Vue                                              | Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects                                              | >=7.0.5      |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | moderate | uuid 8.3.2                   | Taro React、Taro Vue                                              | uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided                                                                    | >=11.1.1     |
| [GHSA-356w-63v5-8wf4](https://github.com/advisories/GHSA-356w-63v5-8wf4) | moderate | vite 5.2.8                   | Uni                                                               | Vite has an `server.fs.deny` bypass with an invalid `request-target`                                                                  | >=5.4.18     |
| [GHSA-4r4m-qw57-chr8](https://github.com/advisories/GHSA-4r4m-qw57-chr8) | moderate | vite 5.2.8                   | Uni                                                               | Vite has a `server.fs.deny` bypassed for `inline` and `raw` with `?import` query                                                      | >=5.4.16     |
| [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | moderate | vite 5.2.8                   | Uni                                                               | Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling                                                                   | >=6.4.2      |
| [GHSA-64vr-g452-qvp3](https://github.com/advisories/GHSA-64vr-g452-qvp3) | moderate | vite 5.2.8                   | Uni                                                               | Vite DOM Clobbering gadget found in vite bundled scripts that leads to XSS                                                            | >=5.2.14     |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | moderate | vite 5.2.8                   | Uni                                                               | launch-editor: escapeCmdArgs() omits % escaping on Windows                                                                            | >=6.4.4      |
| [GHSA-859w-5945-r5v3](https://github.com/advisories/GHSA-859w-5945-r5v3) | moderate | vite 5.2.8                   | Uni                                                               | Vite's server.fs.deny bypassed with /. for files under project root                                                                   | >=5.4.19     |
| [GHSA-93m4-6634-74q7](https://github.com/advisories/GHSA-93m4-6634-74q7) | moderate | vite 5.2.8                   | Uni                                                               | vite allows server.fs.deny bypass via backslash on Windows                                                                            | >=5.4.21     |
| [GHSA-9cwx-2883-4wfx](https://github.com/advisories/GHSA-9cwx-2883-4wfx) | moderate | vite 5.2.8                   | Uni                                                               | Vite's `server.fs.deny` is bypassed when using `?import&raw`                                                                          | >=5.2.14     |
| [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | moderate | vite 5.2.8                   | Uni                                                               | vite: `server.fs.deny` bypass on Windows alternate paths                                                                              | >=6.4.3      |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | moderate | vite 5.2.8                   | Uni                                                               | launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors                                 | >=6.4.4      |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | moderate | vite 5.2.8                   | Uni                                                               | Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine                    | >=6.4.4      |
| [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | moderate | vite 5.2.8                   | Uni                                                               | launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows                                                                | >=6.4.3      |
| [GHSA-vg6x-rcgg-rjx6](https://github.com/advisories/GHSA-vg6x-rcgg-rjx6) | moderate | vite 5.2.8                   | Uni                                                               | Websites were able to send any requests to the development server and read the response in vite                                       | >=5.4.12     |
| [GHSA-x574-m823-4x7w](https://github.com/advisories/GHSA-x574-m823-4x7w) | moderate | vite 5.2.8                   | Uni                                                               | Vite bypasses server.fs.deny when using ?raw??                                                                                        | >=5.4.15     |
| [GHSA-xcj6-pq6g-qj4x](https://github.com/advisories/GHSA-xcj6-pq6g-qj4x) | moderate | vite 5.2.8                   | Uni                                                               | Vite allows server.fs.deny to be bypassed with .svg or relative paths                                                                 | >=5.4.17     |
| [GHSA-4v9v-hfq4-rm2v](https://github.com/advisories/GHSA-4v9v-hfq4-rm2v) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server users' source code may be stolen when they access a malicious web site                                             | >=5.2.1      |
| [GHSA-79cf-xcqc-c78w](https://github.com/advisories/GHSA-79cf-xcqc-c78w) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server vulnerable to cross-origin source code exposure on non-HTTPS origins                                               | >=5.2.4      |
| [GHSA-9jgg-88mc-972h](https://github.com/advisories/GHSA-9jgg-88mc-972h) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server users' source code may be stolen when they access a malicious web site with non-Chromium based browser             | >=5.2.1      |
| [GHSA-f5vj-f2hx-8m93](https://github.com/advisories/GHSA-f5vj-f2hx-8m93) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server vulnerable to cross-site request forgery via internal developer endpoints                                          | >=5.2.6      |
| [GHSA-m28w-2pqf-7qgj](https://github.com/advisories/GHSA-m28w-2pqf-7qgj) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server vulnerable to denial of service via a malformed Host or Origin header                                              | >=5.2.6      |
| [GHSA-mx8g-39q3-5c79](https://github.com/advisories/GHSA-mx8g-39q3-5c79) | moderate | webpack-dev-server 4.15.2    | Taro React、Taro Vue                                              | webpack-dev-server vulnerable to HMR WebSocket interception via permissive user proxies                                               | >=5.2.5      |
| [GHSA-8rc2-428q-7ww3](https://github.com/advisories/GHSA-8rc2-428q-7ww3) | low      | @intlify/core-base 9.1.11    | Uni                                                               | Vue I18n: `escapeParameter` does not escape named values when the same call also passes a list                                        | >=11.4.14    |
| [GHSA-vpq2-c234-7xj6](https://github.com/advisories/GHSA-vpq2-c234-7xj6) | low      | @tootallnate/once 1.1.2      | Uni                                                               | @tootallnate/once vulnerable to Incorrect Control Flow Scoping                                                                        | >=2.0.1      |
| [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) | low      | cookie 0.6.0                 | Uni                                                               | cookie accepts cookie name, path, and domain with out of bounds characters                                                            | >=0.7.0      |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | low      | deepmerge 4.3.1              | Uni                                                               | deepmerge mergeObject() allows prototype poisoning of returned objects                                                                | 暂无修复范围 |
| [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) | low      | katex 0.16.47                | 根                                                                | KaTeX: Existing prototype pollution can bypass trust restrictions                                                                     | >=0.18.2     |
| [GHSA-m6fv-jmcg-4jfg](https://github.com/advisories/GHSA-m6fv-jmcg-4jfg) | low      | send 0.18.0                  | Uni                                                               | send vulnerable to template injection that can lead to XSS                                                                            | >=0.19.0     |
| [GHSA-m5mm-p8h7-m29v](https://github.com/advisories/GHSA-m5mm-p8h7-m29v) | low      | serialize-javascript 6.0.2   | Taro React、Taro Vue                                              | Serialize JavaScript: Cross-site scripting (XSS) via unescaped </script at the end of a serialized function body                      | >=7.1.3      |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | low      | vite 5.2.8                   | Uni                                                               | Vite: Cross origin script execution through Vite custom middleware                                                                    | >=6.4.4      |
| [GHSA-g4jq-h2w9-997c](https://github.com/advisories/GHSA-g4jq-h2w9-997c) | low      | vite 5.2.8                   | Uni                                                               | Vite middleware may serve files starting with the same name with the public directory                                                 | >=5.4.20     |
| [GHSA-jqfw-vq24-v9c3](https://github.com/advisories/GHSA-jqfw-vq24-v9c3) | low      | vite 5.2.8                   | Uni                                                               | Vite's `server.fs` settings were not applied to HTML files                                                                            | >=5.4.20     |
