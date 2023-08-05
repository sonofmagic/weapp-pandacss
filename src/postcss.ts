import type { PluginCreator, Plugin } from 'postcss'
import selectorParser, {
  tag,
  selector as slt,
  Root,
  Selector
} from 'postcss-selector-parser'
import { escape } from '@weapp-core/escape'
import createCascadeLayersPlugin from '@csstools/postcss-cascade-layers'
import createIsPseudoClassPlugin from '@csstools/postcss-is-pseudo-class'
import { defu } from 'defu'
import type { IPostcssPluginOptions } from './types'
import { getPostcssPluginDefaults } from './defaults'
import { createContext } from './core/context'

const postcssPlugin = 'postcss-weapp-pandacss-escape-wrapper-plugin'

function normalizeString(strs: string | string[]) {
  if (Array.isArray(strs)) {
    return strs.join(',')
  }
  return strs
}
// https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/index.ts
// https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-cascade-layers/src/adjust-selector-specificity.ts
// ':not(#\\#)' raw: :not(#\\\\#)
const postcssWeappPandacssEscapePlugin: PluginCreator<IPostcssPluginOptions> = (
  options
) => {
  const {
    selectorReplacement,
    removeNegationPseudoClass,
    disabled,
    cascadeLayersPluginOptions,
    isPseudoClassPluginOptions
  } = defu<Required<IPostcssPluginOptions>, Required<IPostcssPluginOptions>[]>(
    options,
    getPostcssPluginDefaults()
  )
  if (disabled) {
    return {
      postcssPlugin
    }
  }
  const sr = selectorReplacement as Required<
    Required<IPostcssPluginOptions>['selectorReplacement']
  >
  const utilitiesTransformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      if (selector.type === 'class') {
        selector.value = escape(selector.value)
      }
      if (selector.type === 'combinator') {
        selector.value = '+'
      }
      if (
        selector.type === 'universal' &&
        selector.parent?.type === 'selector'
      ) {
        if (Array.isArray(sr.universal)) {
          const parent = selector.parent as Selector
          const idx = parent.nodes.indexOf(selector)
          if (idx > -1) {
            const rests = parent.nodes.slice(idx + 1)
            // root
            const root = parent.parent as Root | undefined
            if (root) {
              const pidx = root.nodes.indexOf(parent)
              if (pidx > -1) {
                root.nodes.splice(
                  pidx,
                  1,
                  ...sr.universal.map((x) => {
                    return slt({
                      nodes: [
                        tag({
                          value: x
                        }),
                        ...rests
                      ],
                      value: ''
                    })
                  })
                )
              }
            }
          }
        } else {
          selector.value = sr.universal
        }
      }

      if (selector.type === 'pseudo' && selector.parent) {
        // where case
        if (selector.value === ':where' && selector.parent.parent) {
          // :root,:host
          const vals = selector.nodes.map((x) => x.toString())
          vals.length === 2 && vals[0] === ':root' && vals[1] === ':host'
            ? (selector.parent.parent.nodes = [
                tag({
                  value: normalizeString(sr.root)
                })
              ])
            : (selector.parent.parent.nodes = selector.nodes)
        } else if (selector.value === ':root' || selector.value === ':host') {
          selector.parent.nodes = [
            tag({
              value: normalizeString(sr.root)
            })
          ]
        }
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
            if (removeNegationPseudoClass) {
              selector.remove()
            } else {
              x.nodes = [
                tag({
                  value: sr.cascadeLayers
                })
              ]
            }
          }
        }
      }
    })
  })

  const cascadeLayersPlugin = createCascadeLayersPlugin(
    cascadeLayersPluginOptions
  ) as Plugin
  const isPseudoClassPlugin = createIsPseudoClassPlugin(
    isPseudoClassPluginOptions
  ) as Plugin

  return {
    postcssPlugin,
    plugins: [
      async function () {
        try {
          const ctx = await createContext()
          await ctx.codegen()
        } catch (error) {
          console.log((<Error>error).message)
        }
      },
      cascadeLayersPlugin,
      isPseudoClassPlugin,
      {
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
        OnceExit(root) {
          root.walkRules(/:not\(#\\#\)/, (rule) => {
            atLayerTransformer.transformSync(rule, {
              lossless: false,
              updateSelector: true
            })
          })
        }
      }
    ]
  }
}

postcssWeappPandacssEscapePlugin.postcss = true

export default postcssWeappPandacssEscapePlugin
