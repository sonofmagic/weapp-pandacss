import { appRoot, taroAppRoot } from './util'
import { getPandacssConfig, getConfig } from '@/core/config'
describe('config', () => {
  it('get fixtures app config', async () => {
    const config = await getPandacssConfig({
      cwd: appRoot
    })
    expect(config).toBeDefined()
    expect(config.config.outdir === 'src/styled-system').toBe(true)
  })

  it('get fixtures taroApp config', async () => {
    const config = await getPandacssConfig({
      cwd: taroAppRoot
    })
    expect(config).toBeDefined()
    expect(config.config.outdir === 'styled-system').toBe(true)
  })

  it('get default config', async () => {
    const { config, ...rest } = await getConfig()
    console.log(rest)
    expect(config).toMatchSnapshot()
  })
})
