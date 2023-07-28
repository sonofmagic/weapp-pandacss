import type { PluginCreator } from 'postcss'
import selectorParser, { tag } from 'postcss-selector-parser'
import { escape } from '@weapp-core/escape'

const postcssWeappPandacssEscapePlugin: PluginCreator<any> = () => {
  const transformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      if (selector.type === 'class') {
        selector.value = escape(selector.value)
      }
      if (selector.type === 'universal') {
        // TODO configable
        selector.value = 'view'
      }

      if (selector.type === 'pseudo' && selector.value === ':not') {
        for (const x of selector.nodes) {
          if (
            x.nodes.length === 1 &&
            x.nodes[0].type === 'id' &&
            x.nodes[0].value === '#'
          ) {
            x.nodes = [
              tag({
                value: 'n'
              })
            ]
            // x.nodes = [
            //   id({
            //     value: 'n'
            //   })
            // ]
            // x.nodes[0].value = 'n'
          }
        }
      }
      // if (selector.type === 'id' && selector.value === '#') {
      //   selector.value = 'n'
      // }
      // if(selector.type === 'selector' && selector.parent?.type === 'pseudo' && selector.parent.value === ':not')
      // :not(#\\\\#)
    })
  })
  return {
    postcssPlugin: 'postcss-weapp-pandacss-escape-plugin',
    Rule(rule, helper) {
      transformer.transformSync(rule, {
        lossless: false,
        updateSelector: true
      })
    }
  }
}

postcssWeappPandacssEscapePlugin.postcss = true

export default postcssWeappPandacssEscapePlugin
