import { defineConfig } from 'tsdown'

// Panda 2.5's public config types reference these packages transitively.
const pandaDeclarationDependencies = ['@pandacss/types', 'pkg-types', 'exsolve']

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    postcss: 'src/postcss.ts',
    panda: 'src/panda.ts',
    runtime: 'src/runtime.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  deps: {
    onlyBundle: pandaDeclarationDependencies,
    dts: {
      // Keep Panda's public hook contract without exposing its upstream declaration barrel.
      alwaysBundle: pandaDeclarationDependencies,
    },
  },
  clean: true,
  shims: true,
  target: 'node22',
  fixedExtension: false,
})
