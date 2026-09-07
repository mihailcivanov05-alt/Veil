import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // allow importing the shared design system from ../design-system/*.css
    fs: { allow: ['..'] },
  },
})
