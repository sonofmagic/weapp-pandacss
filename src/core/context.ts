import { resolve, dirname } from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { defu } from 'defu'
import { getPandacssConfig } from './config'
import { copyEscape } from './codegen'
import { patch } from './patch'
import { tick, quote, dedent } from './logger'
import { ICreateContextOptions } from '@/types'
import { getCreateContextDefaults } from '@/defaults'

export async function createContext(options?: ICreateContextOptions) {
  const opt = defu(options, getCreateContextDefaults())
  let pandaConfig: Awaited<ReturnType<typeof getPandacssConfig>>
  try {
    pandaConfig = await getPandacssConfig(opt.pandaConfig)
  } catch {
    throw new Error(
      'Cannot find config file: panda.config.ts or panda.config.js/cjs/mjs. Did you forget to run `panda init`?'
    )
  }

  const outdir = pandaConfig.config.outdir
  const projectRoot = dirname(pandaConfig.path)
  async function codegen() {
    const words: string[] = []
    const weappPandaDir = resolve(projectRoot, outdir, 'weapp-panda')
    const patchHelpersPath = resolve(projectRoot, outdir, 'helpers.mjs')
    await copyEscape(weappPandaDir)
    words.push(dedent`
    ${tick} ${quote(outdir, '/weapp-panda')}: the core escape function for weapp
    `)
    if (existsSync(patchHelpersPath)) {
      await fs.copyFile(
        patchHelpersPath,
        resolve(dirname(patchHelpersPath), '_helpers.backup.mjs')
      )
    }

    await patch(patchHelpersPath)
    words.push(dedent`
    ${tick} ${quote(
      outdir,
      '/helpers.mjs'
    )}: inject escape function into helpers
    `)
    if (opt.log) {
      console.log(words.filter(Boolean).join('\n'))
    }
  }

  async function rollback() {
    const patchHelpersBackupPath = resolve(
      projectRoot,
      outdir,
      '_helpers.backup.mjs'
    )
    if (existsSync(patchHelpersBackupPath)) {
      await fs.copyFile(
        patchHelpersBackupPath,
        resolve(dirname(patchHelpersBackupPath), 'helpers.mjs')
      )
    }
  }
  return {
    pandaConfig,
    codegen,
    rollback
  }
}
