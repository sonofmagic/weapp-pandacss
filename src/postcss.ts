import type { PluginCreator, Plugin } from 'postcss'
import selectorParser, { tag } from 'postcss-selector-parser'
import { escape } from '@weapp-core/escape'
import creator from '@csstools/postcss-cascade-layers'
import { defu } from 'defu'
import type { IPostcssPluginOptions } from './types'
import { getPostcssPluginDefaults } from './defaults'

// https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/index.ts
// https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/adjust-selector-specificity.ts
// ':not(#\\#)' raw: :not(#\\\\#)
const postcssWeappPandacssEscapePlugin: PluginCreator<IPostcssPluginOptions> = (
  options
) => {
  const { cascadeLayersSelectorReplacement, universalSelectorReplacement } =
    defu<Required<IPostcssPluginOptions>, IPostcssPluginOptions[]>(
      options,
      getPostcssPluginDefaults()
    )

  const utilitiesTransformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      if (selector.type === 'class') {
        selector.value = escape(selector.value)
      }
      if (selector.type === 'universal') {
        selector.value = universalSelectorReplacement
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
                value: cascadeLayersSelectorReplacement
              })
            ]
          }
        }
      }
    })
  })

  const plugin = creator() as Plugin

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
