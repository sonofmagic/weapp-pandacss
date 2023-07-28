import { createContext } from './core/context'
const args = process.argv.slice(2)

async function codegen() {
  const ctx = await createContext()
  ctx.codegen()
}

if (args[0] === 'codegen') {
  // copy @weapp-core/escape and patch create css
  codegen()
}
