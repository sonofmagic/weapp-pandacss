import type { loadConfigFile } from '@pandacss/config'

export type PandacssConfigFileOptions = Parameters<typeof loadConfigFile>[0]

export interface ICreateContextOptions {
  pandaConfig?: Partial<PandacssConfigFileOptions>
}
