import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { css } from '@styled-system/css'
import './index.scss'

const styles = css({
  backgroundColor: 'gainsboro',
  borderRadius: '9999px',
  fontSize: '13px',
  padding: '10px 15px'
})

const styles0 = css({
  bg: 'gainsboro',
  rounded: '9999px',
  fontSize: '13px',
  p: '10px 15px'
})
export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View>
      <View
        className={css({
          color: 'red.400',
          bg: 'amber.800'
        })}
      >
        <Text>Hello world!</Text>
      </View>
      <Text className={styles}>Text</Text>
      <Text className={styles0}>Text</Text>
      <Text className='aaa'>aaa</Text>
      <Button className='button'>Button</Button>
      <Button className='button--variant-primary'>Button</Button>

      <View
        className={css({
          bg: 'red.400',
          h: '10',
          '&:hover': {
            bg: 'orange.400'
          }
        })}
      >
        112323
      </View>

      <View
        className={css({
          bg: 'blue.400',
          h: '10',
          _hover: {
            bg: 'yellow.400'
          }
        })}
      >
        112323
      </View>

      <View
        className={css({
          bg: 'red.400',
          mt: '4',
          '& text': {
            color: 'gray.100'
          }
        })}
      >
        <Text>pinkpink</Text>
      </View>
    </View>
  )
}
