import type { ICreateContextOptions, IPostcssPluginOptions } from '@/types'

export function getCreateContextDefaults(): Required<ICreateContextOptions> {
  return {
    pandaConfig: {
      cwd: process.cwd()
    }
  }
}

export function getPostcssPluginDefaults(): Required<IPostcssPluginOptions> {
  return {
    selectorReplacement: {
      cascadeLayers: 'n',
      root: 'page',
      universal: ['view', 'text'] // 'view,text'
    }
  }
}
