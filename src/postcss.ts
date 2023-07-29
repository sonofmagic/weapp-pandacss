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
  const { selectorReplacement } = defu<
    Required<IPostcssPluginOptions>,
    Required<IPostcssPluginOptions>[]
  >(options, getPostcssPluginDefaults())
  const sr = selectorReplacement as Required<
    Required<IPostcssPluginOptions>['selectorReplacement']
  >
  const utilitiesTransformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      if (selector.type === 'class') {
        selector.value = escape(selector.value)
      }
      if (selector.type === 'universal') {
        selector.value = sr.universal
      }

      if (
        selector.type === 'pseudo' &&
        selector.value === ':where' &&
        selector.parent &&
        selector.parent.parent
      ) {
        // :root,:host
        const vals = selector.nodes.map((x) => x.toString())
        vals.length === 2 && vals[0] === ':root' && vals[1] === ':host'
          ? (selector.parent.parent.nodes = [
              tag({
                value: sr.root
              })
            ])
          : (selector.parent.parent.nodes = selector.nodes)
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
                value: sr.cascadeLayers
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
