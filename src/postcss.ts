import type { PluginCreator } from 'postcss'

const plugin: PluginCreator<any> = () => {
  return {
    postcssPlugin: 'postcss-weapp-pandacss-escape-plugin',
    Rule(rule, helper) {}
  }
}

plugin.postcss = true

export default plugin
