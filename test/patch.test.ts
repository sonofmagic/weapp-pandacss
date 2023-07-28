import fs from 'node:fs/promises'
import fss from 'node:fs'
import path from 'node:path'
import { appRoot } from './util'
import { inject } from '@/core/patch'
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
})
