import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { css } from '@styled-system/css'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View
      className={css({
        color: 'red.400',
        bg: 'amber.800'
      })}
    >
      <Text>Hello world!</Text>
    </View>
  )
}
