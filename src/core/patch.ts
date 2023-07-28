import fs from 'node:fs/promises'
import * as t from '@babel/types'

import { generate, parse, traverse } from '@/babel'

export function inject(content: string) {
  const root = parse(content, {
    sourceType: 'unambiguous'
  })

  traverse(root, {
    Program: {
      enter(p) {
        // import { escape } from './weapp-panda/index.mjs'
        const node = p.node
        const importNodes = node.body.filter(
          (x) => x.type === 'ImportDeclaration'
        ) as t.ImportDeclaration[]
        const myImport = importNodes.find(
          (x) => x.source.value === './weapp-panda/index.mjs'
        )
        if (!myImport) {
          node.body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier('escape'),
                  t.identifier('escape')
                )
              ],
              t.stringLiteral('./weapp-panda/index.mjs')
            )
          )
        }
      }
    },
    FunctionDeclaration: {
      enter(p) {
        const node = p.node
        if (node.id?.name === 'createCss') {
          const returnFn = node.body.body.find(
            (x) => x.type === 'ReturnStatement'
          ) as t.ReturnStatement | undefined
          if (
            returnFn &&
            returnFn.argument?.type === 'ArrowFunctionExpression'
          ) {
            const arrowFn = returnFn.argument
            if (arrowFn.body.type === 'BlockStatement') {
              const innerReturn = arrowFn.body.body.find(
                (x) => x.type === 'ReturnStatement'
              ) as t.ReturnStatement | undefined
              if (innerReturn) {
                // import { escape } from '@weapp-core/escape'
                const originNode = innerReturn.argument as t.CallExpression
                if (
                  originNode.callee.type === 'Identifier' &&
                  originNode.callee.name === 'escape'
                ) {
                  // has patched
                  return
                }

                innerReturn.argument = t.callExpression(
                  t.identifier('escape'),
                  [originNode]
                )
              }
            }
          }
        }
      }
    }
  })

  return generate(root)
}

export async function patch(src: string, dest?: string) {
  const content = await fs.readFile(src, 'utf8')
  const { code } = inject(content)
  await fs.writeFile(dest ?? src, code, 'utf8')
}
