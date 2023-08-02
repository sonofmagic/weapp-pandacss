
const plugins = {
  '@pandacss/dev/postcss': {},
}
// https://taro-docs.jd.com/docs/envs#processenvtaro_env
if (process.env.TARO_ENV !== 'h5' && process.env.TARO_ENV !== 'rn') {
  /** @type {import('weapp-pandacss').IPostcssPluginOptions} */
  const options = {}
  plugins['weapp-pandacss/postcss'] = options
}


module.exports = {
  plugins
}
