import fs from 'node:fs/promises'
import fss from 'node:fs'
import path from 'node:path'
import { appRoot } from './util'
import { inject, patch } from '@/core/patch'
describe('patch', () => {
  it('default', async () => {
    const content = await fs.readFile(
      path.resolve(appRoot, 'styled-system/helpers.mjs'),
      'utf8'
    )
    const { code } = inject(content)
    const target = path.resolve(appRoot, 'styled-system/helpers.injected.mjs')
    await fs.writeFile(target, code, 'utf8')

    expect(fss.existsSync(target)).toBe(true)
  })

  it('patch', async () => {
    const dest = path.resolve(appRoot, 'styled-system/helpers.patched.mjs')
    await patch(path.resolve(appRoot, 'styled-system/helpers.mjs'), dest)
    expect(fss.existsSync(dest)).toBe(true)
  })

  it('inject again', async () => {
    const content = await fs.readFile(
      path.resolve(appRoot, 'styled-system/helpers.injected.mjs'),
      'utf8'
    )
    const { code } = inject(content)
    const target = path.resolve(appRoot, 'styled-system/helpers.injected0.mjs')
    await fs.writeFile(target, code, 'utf8')

    expect(fss.existsSync(target)).toBe(true)
  })

  it('patch again', async () => {
    const dest = path.resolve(appRoot, 'styled-system/helpers.patched0.mjs')
    await patch(
      path.resolve(appRoot, 'styled-system/helpers.patched.mjs'),
      dest
    )
    expect(fss.existsSync(dest)).toBe(true)
  })
})
