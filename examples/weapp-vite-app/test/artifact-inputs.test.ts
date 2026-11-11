import fs from 'node:fs/promises'
import path from 'node:path'
import { buildTestArtifact, isTestArtifactCurrent } from 'weapp-vite/test'

it('bounds resolver root watches while invalidating artifacts after same-length source edits', async () => {
  const fixtureParent = path.resolve(import.meta.dirname, '../.weapp-vite')
  await fs.mkdir(fixtureParent, { recursive: true })
  const cwd = await fs.mkdtemp(path.join(fixtureParent, 'root-watch-'))
  try {
    const pageRoot = path.join(cwd, 'src/pages/index')
    await fs.mkdir(pageRoot, { recursive: true })
    await Promise.all([
      fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify({ name: 'artifact-input-fixture', private: true })),
      fs.writeFile(path.join(cwd, 'project.config.json'), JSON.stringify({ appid: 'touristappid', compileType: 'miniprogram', miniprogramRoot: 'dist/' })),
      fs.writeFile(path.join(cwd, 'vite.config.mjs'), `
        import path from 'node:path'
        export default {
          weapp: { srcRoot: 'src', platform: 'weapp', autoRoutes: false, tailwindcss: false },
          plugins: [{
            name: 'fixture:resolver-root-watch',
            buildStart() { this.addWatchFile(path.parse(process.cwd()).root) },
          }],
        }
      `),
      fs.writeFile(path.join(cwd, 'src/app.js'), 'App({})'),
      fs.writeFile(path.join(cwd, 'src/app.json'), JSON.stringify({ pages: ['pages/index/index'] })),
      fs.writeFile(path.join(pageRoot, 'index.js'), 'Page({ data: { value: "first" } })'),
      fs.writeFile(path.join(pageRoot, 'index.json'), '{}'),
      fs.writeFile(path.join(pageRoot, 'index.wxml'), '<view>{{value}}</view>'),
    ])

    const artifact = await buildTestArtifact({ cwd, skipNpm: true })
    expect(await isTestArtifactCurrent(artifact)).toBe(true)
    const page = path.join(artifact.miniprogramRootPath, 'pages/index/index.js')
    expect(await fs.readFile(page, 'utf8')).toContain('first')

    await fs.writeFile(path.join(pageRoot, 'index.js'), 'Page({ data: { value: "other" } })')
    expect(await isTestArtifactCurrent(artifact)).toBe(false)
    const rebuilt = await buildTestArtifact({ cwd, skipNpm: true })
    expect(await isTestArtifactCurrent(rebuilt)).toBe(true)
    expect(await fs.readFile(path.join(rebuilt.miniprogramRootPath, 'pages/index/index.js'), 'utf8')).toContain('other')
  }
  finally {
    await fs.rm(cwd, { recursive: true, force: true })
  }
})
