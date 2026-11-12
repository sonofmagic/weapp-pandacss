# 依赖升级与上游补丁移除（2026-11-12）

本轮以已合入版本准备 PR #168 的 main 为基线，覆盖根工具链、两个发布包、文档站和五个活动示例；历史 `examples/taro-app-linaria` 继续排除。版本评估逐包核对了 134 个依赖名的 npm 元数据，沿用稳定版本和框架兼容范围优先的策略。

## 采用的版本

| 范围                  | 本轮采用                                                |
| --------------------- | ------------------------------------------------------- |
| Weapp Vite / Wevu     | 7.10.0；Vue 3.5.45                                      |
| mpcore                | test / vitest 1.2.4、weapp-vite 1.1.4                   |
| Uni-app               | 官方 `3.0.0-5030420261029002` 编译器版本组              |
| 适配器 Babel          | generator / parser / traverse / types 8.1.2             |
| Weapp Vite 示例 Babel | core 8.1.2                                              |
| Taro Babel runtime    | 7.29.14                                                 |
| 根工具链              | pnpm 12.18.0、Turbo 2.11.11                             |
| 文档站                | Astro 7.4.11、eslint-plugin-mdx 3.9.5、Wrangler 4.160.1 |

精确版本、`^` 和 `~` 的原有声明形式保持不变，解析结果由根锁文件记录。开发环境继续使用 Node 24.22.1，发布包消费者下限保持 `^22.18.0 || >=24.11.0`。

## Weapp Vite 与 Uni-app 的兼容边界

[上游 PR #1317](https://github.com/weapp-vite/weapp-vite/pull/1317) 已合并，并随 Weapp Vite 7.10.0 发布。已检查 npm tarball 中的 `dist/test.mjs`：根目录判断使用真实路径，根目录只摘要直接成员，同时保留显式源码的内容指纹和排除目录语义。因此移除 7.9.0 的补丁文件及 `patchedDependencies` 条目，继续用现有真实构建测试验证根目录监听、同长度源码改写后的失效和重新生成产物。

Uni-app 的 `latest` 标签部分指向旧版或 alpha，不能作为 Vue 3 正式编译器组的升级目标。本轮核对所有直接使用的 DCloud 编译器包后，统一采用正式批次 `3.0.0-5030420261029002`。该批次仍要求 Vite 5.2.8、Vue/runtime/compiler 3.4.21 和 `@dcloudio/types@3.4.31`，这些依赖保持原版本。新版 `uni-mp-vite` 的 `independentMain` 仍通过 `require('estree-walker')` 使用未声明的依赖，因此将现有局部 `packageExtensions` 迁移到新批次，继续绑定 CJS 的 2.0.2。

其余保留项沿用[前次评估](./dependency-review-2026-11-11.md)：

- TypeScript 6.0.3：最新 vue-tsc 仍为 3.3.14，TypeScript 7 的入口兼容问题尚未解除。
- Taro 4.3.2：保留 React 18、Babel 7、Webpack 5.111 补丁线及两份现有补丁；只更新兼容的 Babel runtime 7.29.14。
- NutUI：当前 `latest` 标签仍指向预发布版本，保留 React 3.0.20 / Vue 4.3.14 的稳定版本。
- Panda：2.5.0 仍为稳定最新版，2.1.2 精确别名继续验证最低兼容版本；稳定版无上限策略与 AST 结构契约保持不变。
- repoctl 6.5.4：升级预览显示受管配置和技能均无需变更，已有 release 与 Vitest 定制由三方合并识别并保留。

## 安全审计与验证

升级前后完整审计均为 59 项（Low 10、Moderate 35、High 11、Critical 3）。逐项比较 GHSA、严重程度和受影响版本，三者完全一致；没有新增或消除公告。高危与严重项的来源、影响和上游修复范围已重新核对，仍受前次评估记录的 Taro 下载客户端、Webpack runner 和 Uni 官方 Vite/Vue 编译器组边界约束，不能通过强制跨主版本替换视为修复。兼容范围内的传递依赖已刷新，包括 Babel 7/8 补丁、Astro 内部包和 lint 工具依赖。

原审计门禁报告 487 条新增父子依赖边。其中 485 条在将升级前版本映射到本轮实际版本后，与原有工作区、受影响版本和父子关系逐一对应，涉及 DCloud、Weapp Vite/Wevu/mpcore、Astro、MDX、React lint 插件和 npm-packlist。剩余两条是真实新增来源：`workspace:examples/uni-app-vue3 → @dcloudio/uni-mp-alipay → jimp@0.10.3`。新版支付宝编译器新增 Jimp 声明，从而到达原已存在于微信/百度编译器链中的 `phin@2.9.3`；受影响工作区和版本没有增加，但支付宝工具链也应计入来源。

这条路径对应 [GHSA-x565-32qp-m3vf](https://github.com/advisories/GHSA-x565-32qp-m3vf)：Phin 在重定向后可能继续发送敏感请求头，当前公告没有修复范围。它属于编译器图像处理的 Node 工具依赖，本示例的小程序/H5 页面不携带 Phin。保留官方编译器组并明确记录新增路径，不把本轮构建成功当作漏洞已修复。

`e2e/audit-baseline.json` 更新审阅日期、报告链接和上述精确依赖边；GHSA、受影响版本、严重程度、数量及 `audit.ts` 的断言均保持原值。`pnpm audit --audit-level=moderate` 因这 59 项遗留公告返回 1；`pnpm audit:acceptance` 已通过更新后的逐项基线。

## 安装图 peer 与工作区提示

`repo deps check`、发布包的 `repo deps peers` 和 catalog 检查全部通过。原生 `pnpm peers check --json` 仍返回 1，不能将发布包 peer 检查通过表述为整个安装图无告警：

- 两个 Taro framework 的可选 Vite 路径要求 `^4`，解析到 8.3.8；示例实际采用 Webpack。runner/loader/prebundle 精确要求 Webpack 5.91.0，继续使用已验证的 5.111.1。
- Weapp Vite 的 Babel 8 preset 引入的 polyfill-corejs3/helper 仍声明 Babel core `^7.29.7`，实际为 8.1.2；保留上游 Babel 8 组合并验证真实构建。
- pnpm 12.18 的重解析使 Taro Vue 的 H5 插件下 `components-react` 不再借用兄弟 React 示例的 18.3.1，暴露其必需 React peer 缺失。对比前后锁文件可确认这项变化。Vue 示例明确选择 `framework: 'vue3'`，小程序与 H5 构建及三浏览器交互均通过；不为未使用的 React 渲染路径引入 Vue 示例的运行时依赖，也不抑制该诊断。

`repo doctor` 与升级前同为 98 pass / 66 warn / 0 fail。66 条包括模板版本 3、模板实例定制差异 53、根配置版本 3、根配置定制差异 5，以及 selector-parser override 无法由工具证明同步而产生的 lockfile-sync / installation-state 各 1 条。受管更新预览没有待应用内容，frozen install 已单独验证锁文件一致性。lint 保留原有 6 条 console warning，无错误。

## 本地验证

| 检查                              | 结果                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| frozen install                    | pnpm 12.18.0 通过，锁文件无需解析或修改                                                                |
| repo deps check / peers / catalog | 145 consistent、2 managed、3 exception、0 conflict；发布包 2 pass；catalog 检查通过                    |
| repo doctor                       | 98 pass / 66 warn / 0 fail，提示如上                                                                   |
| pnpm validate / repo check --full | 构建、lint、类型、声明、测试全部通过                                                                   |
| 完整 Vitest                       | 38 文件、435 项通过；statements 371/371、branches 334/334、functions 102/102、lines 341/341，均为 100% |
| pnpm build:examples / pack:check  | 五个活动示例与两个发布包的 tarball 内容检查通过                                                        |
| pnpm test:consumer:matrix         | Node 22.18.0 / 24.11.0 × Panda 2.1.2 / 2.5.0 四格通过                                                  |
| pnpm test:e2e:weapp               | 3 文件、7 项通过，含根目录监听、同长度源码改写与缓存失效回归                                           |
| pnpm test:e2e:h5                  | Taro React、Taro Vue、Uni：三浏览器共 24 项通过                                                        |
| pnpm test:e2e:web                 | Chromium / Firefox / WebKit 共 42 项通过                                                               |
| 文档 stable / preview             | 各 54 页、27 对语言页面；各 139 项三浏览器断言通过，既有 2 项真实剪贴板测试仅 Chromium 执行            |
| 文档示例 / changeset              | 双语首页可执行示例通过；中文 patch changeset 校验通过                                                  |

消费者矩阵仍执行真实 tarball 安装、ESM/CJS 入口、公开类型、Panda codegen/cssgen/build、运行时和 PostCSS 场景。H5 使用 Chromium、Firefox、WebKit 的后台测试，覆盖实际点击、动态属性、预处理器、Unicode、单位及 Uni Tailwind recipe。测试会话和预览服务器由 Playwright 管理并关闭。

本轮没有执行真实微信 IDE 交互，不将 mpcore 断言表述为 IDE 像素验收。原始日志及消费者证据位于本机 `/private/tmp/weapp-pandacss-deps-20261112/`。没有执行 npm 发布或文档部署。
