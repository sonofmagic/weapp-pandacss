import { readFileSync } from 'node:fs'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { visualizer } from 'rollup-plugin-visualizer'
import { RollupOptions } from 'rollup'
import json from '@rollup/plugin-json'
const pkg = JSON.parse(
  readFileSync('./package.json', {
    encoding: 'utf8'
  })
)
// import replace from '@rollup/plugin-replace'
// import terser from '@rollup/plugin-terser'
const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

const dependencies = pkg.dependencies as Record<string, string> | undefined

const config: RollupOptions = {
  input: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    postcss: 'src/postcss.ts'
  },
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs'
    },
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs'
    }
  ],
  plugins: [
    json(),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.build.json', sourceMap: isDev })
  ],
  external: [...(dependencies ? Object.keys(dependencies) : [])]
}

export default config
