import { defineConfig } from 'vitest/config'
import preactPlugin from '@preact/preset-vite'

export default defineConfig({
  plugins: [preactPlugin()],
  test: {
    dir: 'test',
  }
})