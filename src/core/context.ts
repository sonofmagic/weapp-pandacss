import { resolve } from 'node:path'
import { defu } from 'defu'
import { getPandacssConfig } from './config'
import { copyEscape } from './codegen'
import { patch } from './patch'
import { tick, quote, dedent } from './logger'
import { ICreateContextOptions } from '@/types'
import { getDefaults } from '@/defaults'

export async function createContext(options?: ICreateContextOptions) {
  const opt = defu(options, getDefaults())

  const pandaConfig = await getPandacssConfig(opt.pandaConfig)

  async function codegen() {
    const words: string[] = []
    const outdir = pandaConfig.config.outdir
    const weappPandaDir = resolve(outdir, 'weapp-panda')
    const patchHelpersPath = resolve(outdir, 'helpers.mjs')
    await copyEscape(weappPandaDir)
    words.push(dedent`
    ${tick} ${quote(outdir, '/weapp-panda')}: the core escape function for weapp
    `)
    await patch(patchHelpersPath)
    words.push(dedent`
    ${tick} ${quote(
      outdir,
      '/helpers.mjs'
    )}: inject escape function into helpers
    `)
    console.log(words.filter(Boolean).join('\n'))
  }
  return {
    pandaConfig,
    codegen
  }
}
