import { loadConfigFile } from '@pandacss/config'
import { defu } from 'defu'
import { PandacssConfigFileOptions } from '@/types'

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
