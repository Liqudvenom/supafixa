import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { londynekFeed } from './dev/londynekFeed.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), londynekFeed()],
})
