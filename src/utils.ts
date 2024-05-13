import fs from 'node:fs/promises'

function normalizeString(strs: string | string[], separator = ',') {
  if (Array.isArray(strs)) {
    return strs.join(separator)
  }
  return strs
}
// https://github.com/vuejs/vue/blob/49b6bd4264c25ea41408f066a1835f38bf6fe9f1/src/v3/reactivity/computed.ts#L37
function ref<T>(value: T) {
  return {
    value,
  }
}

type Ref<T> = ReturnType<typeof ref<T>>

async function ensureDir(p: string) {
  try {
    await fs.access(p)
  }
  catch {
    await fs.mkdir(p, {
      recursive: true,
    })
  }
}

export { normalizeString, ref, Ref, ensureDir }
// 懒惰做法
// function computed<T>(getter: (...args: any[]) => T) {
//   return {
//     get value() {
//       return getter()
//     }
//   }
// }

export { default as dedent } from 'dedent'

export { defu } from 'defu'

export { default as merge } from 'merge'
