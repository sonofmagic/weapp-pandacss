import type { PluginCreator } from 'postcss'

const postcssWeappPandacssEscapePlugin: PluginCreator<any> = () => {
  return {
    postcssPlugin: 'postcss-weapp-pandacss-escape-plugin'
  }
}

postcssWeappPandacssEscapePlugin.postcss = true

export default postcssWeappPandacssEscapePlugin
