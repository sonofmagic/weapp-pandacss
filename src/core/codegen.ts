import fs from 'node:fs/promises'
import path from 'node:path'

export async function ensureDir(p: string) {
  try {
    await fs.access(p)
  } catch {
    await fs.mkdir(p, {
      recursive: true
    })
  }
}

export function getWeappCoreEscapeDir() {
  return path.dirname(require.resolve('@weapp-core/escape'))
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
