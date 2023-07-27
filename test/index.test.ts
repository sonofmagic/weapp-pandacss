import { foo } from '@/index'

describe('[Default]', () => {
  test('foo should be bar', () => {
    expect(foo).toBe('bar')
  })
})
