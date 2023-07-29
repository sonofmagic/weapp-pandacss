import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import postcss from 'postcss'
// import parser from 'postcss-selector-parser'
import { cssRoot } from './util'
import postcssPlugin from '@/postcss'
describe('postcss', () => {
  it('default', async () => {
    const rawCss = await fs.readFile(resolve(cssRoot, 'default.css'), 'utf8')
    const { css } = await postcss([postcssPlugin]).process(rawCss)
    expect(css).toMatchSnapshot()
  })

  it('default without layer', async () => {
    const rawCss = await fs.readFile(
      resolve(cssRoot, 'default-without-layer.css'),
      'utf8'
    )
    const { css } = await postcss([postcssPlugin]).process(rawCss)
    expect(css).toMatchSnapshot()
  })

  it('simple universal selector', async () => {
    const { css } = await postcss([postcssPlugin]).process(`*{}`)
    expect(css).toMatchSnapshot()
  })
  it('universal selector', async () => {
    const { css } = await postcss([postcssPlugin]).process(
      ` *, *::before, *::after, ::backdrop{}`
    )
    expect(css).toMatchSnapshot()
  })

  // it('... :where', () => {
  //   const t = parser((selectors) => {
  //     selectors.walk((selector) => {
  //       console.log(selector)
  //     })
  //   })

  //   t.processSync(':root,:host')
  // })
})
