import { getCreateContextDefaults, getPostcssPluginDefaults } from '@/defaults'

describe('defaults', () => {
  it('getCreateContextDefaults', () => {
    const config = getCreateContextDefaults()
    expect(config).toBeDefined()
    expect(config.pandaConfig).toBeDefined()
    expect(config.pandaConfig.cwd).toBeDefined()
    expect(config.pandaConfig.cwd).toBe(process.cwd())
  })

  it('getPostcssPluginDefaults', () => {
    const { cascadeLayersSelectorReplacement, universalSelectorReplacement } =
      getPostcssPluginDefaults()
    expect(cascadeLayersSelectorReplacement).toBeDefined()
    expect(universalSelectorReplacement).toBeDefined()
  })
})
