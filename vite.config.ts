import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Fail the build rather than shipping a bundle whose auth is stubbed out.
  // src/lib/env.ts throws at runtime too; this catches it before deploy.
  if (mode === 'production') {
    const { VITE_AUTH_MODE } = loadEnv(mode, process.cwd(), 'VITE_')
    if (VITE_AUTH_MODE?.trim() === 'stub') {
      throw new Error(
        'VITE_AUTH_MODE=stub cannot be used in a production build. ' +
          'Set VITE_AUTH_MODE=api (or unset it) before running pnpm build.',
      )
    }
  }

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          // Framework code changes rarely; app code changes constantly.
          // Splitting them means a page edit doesn't invalidate MUI in
          // every returning user's cache.
          manualChunks: (id: string) => {
            if (!id.includes('node_modules')) return
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui'
            if (id.includes('react-router')) return 'react'
            if (id.includes('/react-dom/') || id.includes('/react/')) return 'react'
            if (id.includes('@tanstack')) return 'query'
            return 'vendor'
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
