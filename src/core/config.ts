import { loadConfigFile } from '@pandacss/config'
import { defu } from 'defu'
import { loadConfig } from 'c12'
import { getCreateContextDefaults, getPostcssPluginDefaults } from '../defaults'
import { PandacssConfigFileOptions, UserConfig } from '@/types'
export function getPandacssConfig(
  options?: Partial<PandacssConfigFileOptions>
) {
  const opt = defu<PandacssConfigFileOptions, PandacssConfigFileOptions[]>(
    options,
    {
      cwd: process.cwd()
    }
  )

  return loadConfigFile(opt)
}

export function getConfig(cwd?: string) {
  return loadConfig<UserConfig>({
    name: 'weapp-pandacss', // `${name}.config` //
    rcFile: false,
    globalRc: false,
    cwd,
    defaults: {
      context: getCreateContextDefaults(),
      postcss: getPostcssPluginDefaults()
    }
  })
}

export function defineConfig(config: UserConfig) {
  return config
}
