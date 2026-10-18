import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Kingdom-Dating/',
  server: {
    port: 3000,
    host: true
  }
})
