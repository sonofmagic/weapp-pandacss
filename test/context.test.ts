import { copyFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { appRoot } from './util'
import { createContext } from '@/core/context'
describe('context', () => {
  it('no config', async () => {
    // expect(ctx).toBeDefined()
    await expect(() => {
      return createContext()
    }).rejects.toThrowError()
  })

  it('with config in app', async () => {
    const ctx = await createContext({
      pandaConfig: {
        cwd: appRoot
      }
    })
    expect(ctx).toBeDefined()
    expect(ctx.codegen).toBeDefined()
    expect(ctx.pandaConfig).toBeDefined()
    expect(ctx.rollback).toBeDefined()
    await copyFile(
      resolve(appRoot, 'styled-system/helpers.mjs'),
      resolve(appRoot, 'src/styled-system/helpers.mjs')
    )
    await ctx.codegen()
    const src = resolve(appRoot, 'src/styled-system/helpers.mjs')
    const backup = resolve(appRoot, 'src/styled-system/_helpers.backup.mjs')
    existsSync(src)
    existsSync(backup)
    expect(await readFile(src, 'utf8')).not.toEqual(
      await readFile(backup, 'utf8')
    )
    await ctx.rollback()
    expect(await readFile(src, 'utf8')).toEqual(await readFile(backup, 'utf8'))
  })
})
