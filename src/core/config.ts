import { loadConfigFile } from '@pandacss/config'

export function getPandacssConfig(
  options: Parameters<typeof loadConfigFile>[0]
) {
  return loadConfigFile(options)
}
