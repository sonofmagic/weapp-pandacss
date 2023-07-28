import path from 'node:path'
import fs from 'node:fs'
import { deleteAsync } from 'del'
import { appRoot } from './util'
import { getPandacssConfig } from '@/core/config'
import { getWeappCoreEscapeDir, copyEscape } from '@/core/codegen'
describe('codegen', () => {
  it('has install WeappCoreEscape', () => {
    const dir = getWeappCoreEscapeDir()
    expect(dir).toBeDefined()
  })

  it('codegen to fixtures app', async () => {
    const { config } = await getPandacssConfig({
      cwd: appRoot
    })

    const target = path.resolve(appRoot, config.outdir, 'weapp-panda')
    await deleteAsync([target])
    expect(fs.existsSync(target)).toBe(false)
    const res = await copyEscape(target)
    expect(res.length).toBe(3)
    for (const filename of res) {
      expect(fs.existsSync(filename)).toBe(true)
    }
  })
})
