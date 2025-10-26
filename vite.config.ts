import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/dot-to-dot-studio/',
  plugins: [react()],
})
