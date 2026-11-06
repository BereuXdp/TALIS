import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Em desenvolvimento, /api vai para a API publicada do TALIS.
// Troque TALIS_API para apontar para uma API local (ex.: http://localhost:3333).
const target = process.env.TALIS_API || 'https://talis.devmais.com'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: { '/api': { target, changeOrigin: true, secure: true } },
  },
  build: {
    rollupOptions: {
      // duas páginas: o painel (index.html) e a landing page (site/index.html)
      input: {
        painel: resolve(import.meta.dirname, 'index.html'),
        site: resolve(import.meta.dirname, 'site/index.html'),
      },
    },
  },
})
