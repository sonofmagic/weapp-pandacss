import { resolve } from 'node:path'
import { defu } from 'defu'
import { getPandacssConfig } from './config'
import { copyEscape } from './codegen'
import { patch } from './patch'
import { ICreateContextOptions } from '@/types'
import { getDefaults } from '@/defaults'

export async function createContext(options?: ICreateContextOptions) {
  const opt = defu(options, getDefaults())
  const pandaConfig = await getPandacssConfig(opt.pandaConfig)

  async function codegen() {
    await copyEscape(resolve(pandaConfig.config.outdir, 'weapp-panda'))
    await patch(resolve(pandaConfig.config.outdir, 'helpers.mjs'))
  }
  return {
    pandaConfig,
    codegen
  }
}
