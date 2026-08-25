import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' with { type: 'json' }
import { extensionTarget } from './build/target.ts'

const target = extensionTarget(process.env.TRANSLATOR_BROWSER)

function extraApiHostPermissions(): string[] {
  const raw = process.env.VITE_API_BASE_URL
  if (!raw) return []
  try {
    const url = new URL(raw)
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return []
    return [`${url.origin}/*`]
  } catch {
    return []
  }
}

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: {
        ...manifest,
        name: target.name,
        host_permissions: [
          ...manifest.host_permissions,
          ...extraApiHostPermissions(),
        ],
      },
      liveReload: false,
      contentScripts: { hmrTimeout: 60_000 },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174,
    },
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  build: {
    outDir: target.outDir,
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      preserveEntrySignatures: 'exports-only',
    },
  },
})
