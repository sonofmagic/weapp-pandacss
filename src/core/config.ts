import { loadConfigFile } from '@pandacss/config'
import { defu } from 'defu'
import { loadConfig, UserInputConfig, createDefineConfig } from 'c12'
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

export function getConfig(options?: Pick<UserInputConfig, 'cwd'>) {
  return loadConfig<UserConfig>({
    name: 'weapp-pandacss', // `${name}.config` //
    rcFile: false,
    globalRc: false,
    cwd: options?.cwd,
    defaults: {
      context: getCreateContextDefaults(),
      postcss: getPostcssPluginDefaults()
    }
  })
}
export const defineConfig = createDefineConfig<UserConfig>()
// export function defineConfig(config: UserConfig) {
//   return config
// }
