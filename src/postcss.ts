import type { PluginCreator, Plugin } from 'postcss'
import selectorParser, { tag } from 'postcss-selector-parser'
import { escape } from '@weapp-core/escape'
import creator from '@csstools/postcss-cascade-layers'

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

      if (
        selector.type === 'pseudo' &&
        selector.value === ':where' &&
        selector.parent &&
        selector.parent.parent
      ) {
        selector.parent.parent.nodes = selector.nodes // .map((x) => x.nodes[0])
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

  const plugin = creator() as Plugin
  // plugin.OnceExit
  return {
    postcssPlugin: 'postcss-weapp-pandacss-escape-plugin',
    Declaration(decl) {
      decl.prop = escape(decl.prop)
    },
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
    OnceExit(root, helper) {
      plugin.OnceExit?.(root, helper)
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
