import { cac } from 'cac'
import { createContext } from './core/context'

let ctx: Awaited<ReturnType<typeof createContext>>

async function initCtx() {
  if (ctx) {
    return ctx
  }
  ctx = await createContext()
  return ctx
}

const cli = cac()

cli.command('codegen', 'code generate').action(async () => {
  await initCtx()
  await ctx.codegen()
})

cli.command('rollback', 'rollback inject').action(async () => {
  await initCtx()
  await ctx.rollback()
})

cli.help()

cli.parse()
