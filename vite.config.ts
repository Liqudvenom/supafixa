import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { londynekFeed } from './dev/londynekFeed.ts'

// https://vite.dev/config/
export default defineConfig({
  // Project site is https://<user>.github.io/supafixa/ — only the Pages build needs that prefix.
  base: process.env.GITHUB_PAGES ? '/supafixa/' : '/',
  plugins: [react(), londynekFeed()],
})
