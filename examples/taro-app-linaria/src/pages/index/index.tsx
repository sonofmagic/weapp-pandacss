import { styled } from '@linaria/react'
import { css } from '@linaria/core'
import { View, ViewProps } from '@tarojs/components'

import React from 'react'
import './index.scss'

declare type Component<TProps> =
  | ((props: TProps) => any)
  | {
      new (props: TProps): any
    }

type VPS = ViewProps & { style?: React.CSSProperties }
type TP = VPS & { color: string }
const Title = styled<TP, VPS, Component<TP>>(View)`
  color: ${(props) => props.color};
`

const style = css`
  color: yellow;
  background: blue;
`

const Index: React.FC = () => {
  return (
    <>
      <Title color='red'>Hello World!</Title>
      <View className={style}>style</View>
    </>
  )
}

export default Index
