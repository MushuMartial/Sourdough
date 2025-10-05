import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // En production (GitHub Pages), on met ton sous-répertoire
  const isProd = mode === 'production'

  return {
    plugins: [vue()],
    base: isProd ? '/Sourdough/' : '/', // ⚠️ adapte le nom ici
  }
})