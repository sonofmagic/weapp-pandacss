import type { loadConfigFile } from '@pandacss/config'

export type PandacssConfigFileOptions = Parameters<typeof loadConfigFile>[0]

export interface ICreateContextOptions {
  pandaConfig?: Partial<PandacssConfigFileOptions>
}

/**
 * @description 核心插件 `weapp-pandacss/postcss` 的配置项
 */
export interface IPostcssPluginOptions {
  /**
   * @description 选择器转义替换字符
   */
  selectorReplacement?: {
    /**
     * @description `:not(#\#)` 的转义方案
     * 默认是 `:not(#\#)` -> `:not(n)`
     * @default 'n'
     */
    cascadeLayers?: string
    /**
     * @description `*` 的转义方案
     * 默认是 `*` 展开 -> `view,text`
     * @default `['view', 'text']`
     */
    universal?: string | string[]
    /**
     * @description `:root` 的转义方案
     * 默认是 `:root` -> `page`
     * @default 'page'
     */
    root?: string | string[]
  }
  /**
   * @description 是否去除所有的 `:not(#\#)` 选择器
   * @default true
   */
  removeNegationPseudoClass?: boolean
}
