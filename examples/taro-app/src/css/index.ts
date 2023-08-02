import { css, cva, cx } from 'styled-system/css'

const styleButton = cva({
  base: {
    display: 'flex'
  },
  variants: {
    visual: {
      solid: { bg: 'red.200', color: 'white' },
      outline: { borderWidth: '1px', borderColor: 'red.200' }
    },
    size: {
      sm: { padding: '4', fontSize: '12px' },
      lg: { padding: '8', fontSize: '24px' }
    }
  },
  compoundVariants: [
    {
      css: {

      },
      size: 'lg',
      visual: 'outline'
    }
  ]
});


// https://cva.style/docs/getting-started/variants
// tailwindcss
