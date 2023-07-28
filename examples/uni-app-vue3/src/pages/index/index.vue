<template>
  <view class="content">

    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view :class="aaa">aaa</view>
  </view>
</template>

<script setup lang="ts">
import { css } from '@/styled-system/css'
import { ref } from 'vue'
const title = ref('Hello')
const aaa = css({
  color: 'red.300',
  bg: 'blue.300'
})
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
