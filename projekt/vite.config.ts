import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Provides default for local dev; override via VITE_PARTYKIT_HOST env var in production
    'import.meta.env.VITE_PARTYKIT_HOST': JSON.stringify(
      process.env.VITE_PARTYKIT_HOST ?? 'localhost:1999'
    ),
  },
})
