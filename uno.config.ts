// uno.config.ts
import { defineConfig, presetWind3 } from 'unocss'
import { presetTypography } from '@unocss/preset-typography'

export default defineConfig({
  presets: [presetTypography(), presetWind3()]
})