import { bold, green, cyan } from 'colorette'

export const tick = bold(green('✔️'))

export const quote = (...str: string[]) => cyan(`\`${str.join('')}\``)
