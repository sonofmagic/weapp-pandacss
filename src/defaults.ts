import type { ICreateContextOptions } from '@/types'

export function getDefaults(): ICreateContextOptions {
  return {
    pandaConfig: {
      cwd: process.cwd()
    }
  }
}
