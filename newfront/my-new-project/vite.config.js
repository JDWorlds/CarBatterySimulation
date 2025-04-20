import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5119' // .NET API 서버 주소
    }
  },
  css: {
    postcss :{
      plugins: [tailwindcss()],
    }
  }
})
