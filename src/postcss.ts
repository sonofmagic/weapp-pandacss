import type { PluginCreator } from 'postcss'
import selectorParser, { tag } from 'postcss-selector-parser'
import { escape } from '@weapp-core/escape'

const postcssWeappPandacssEscapePlugin: PluginCreator<any> = () => {
  const utilitiesTransformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      if (selector.type === 'class') {
        selector.value = escape(selector.value)
      }
      if (selector.type === 'universal') {
        // TODO configable
        selector.value = 'view'
      }
    })
  })

  const atLayerTransformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
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
          }
        }
      }
    })
  })
  return {
    postcssPlugin: 'postcss-weapp-pandacss-escape-plugin',
    Rule(rule) {
      utilitiesTransformer.transformSync(rule, {
        lossless: false,
        updateSelector: true
      })
    },
    // https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/index.ts
    // https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/adjust-selector-specificity.ts
    // ':not(#\\#)'
    // if(selector.type === 'selector' && selector.parent?.type === 'pseudo' && selector.parent.value === ':not')
    // :not(#\\\\#)
    OnceExit(root) {
      root.walkRules(/:not\(#\\#\)/, (rule) => {
        atLayerTransformer.transformSync(rule, {
          lossless: false,
          updateSelector: true
        })
      })
    }
  }
}

postcssWeappPandacssEscapePlugin.postcss = true

export default postcssWeappPandacssEscapePlugin
