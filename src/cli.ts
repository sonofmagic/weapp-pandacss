import { createContext } from './core/context'
const args = process.argv.slice(2)

async function main() {
  const ctx = await createContext()
  if (args[0] === 'codegen') {
    // copy @weapp-core/escape and patch create css
    ctx.codegen()
  }
}

main()
