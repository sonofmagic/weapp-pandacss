
const plugins = {
  '@pandacss/dev/postcss': {},
}
// https://taro-docs.jd.com/docs/envs#processenvtaro_env
if (process.env.TARO_ENV !== 'h5' && process.env.TARO_ENV !== 'rn') {
  plugins['weapp-pandacss/postcss'] = {}
}


module.exports = {
  plugins
}
