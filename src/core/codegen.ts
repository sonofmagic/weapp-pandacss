import fs from 'node:fs/promises'
import path from 'node:path'
import type { ICreateContextOptions } from '@/types'
import { dedent, ensureDir } from '@/utils'

export function getWeappCoreEscapeDir() {
  return path.dirname(require.resolve('@weapp-core/escape'))
}

export function getPandaVersion() {
  return require(require.resolve('@pandacss/dev/package.json')).version
}

// dirName: string = 'weapp-panda'
export async function copyEscape(destDir: string) {
  const result: string[] = []
  const srcDir = getWeappCoreEscapeDir()
  const filesnames = await fs.readdir(srcDir)
  await ensureDir(destDir)

  for (const filesname of filesnames) {
    const src = path.resolve(srcDir, filesname)
    const stats = await fs.stat(src)
    if (stats.isFile()) {
      const dest = path.resolve(destDir, filesname)
      result.push(dest)
      await fs.copyFile(src, dest)
    }
  }
  return result
}

export async function generateEscapeWrapper(
  destDir: string,
  options: ICreateContextOptions,
) {
  await ensureDir(destDir)
  const code = dedent`
  import { escape as _escape } from './lib/index.mjs'

  function predicate(className){
    if(${options.escapePredicate}){
      return true
    }
    return false
  }

  function escape(className) {
    if(predicate(className)){
      return _escape(className)
    }
    return className
  }
  export { escape }
  `
  await fs.writeFile(path.resolve(destDir, 'index.mjs'), code, 'utf8')
  await fs.writeFile(
    path.resolve(destDir, 'index.d.ts'),
    dedent`
    export declare function escape(selectors: string): string;`,
    'utf8',
  )
}
