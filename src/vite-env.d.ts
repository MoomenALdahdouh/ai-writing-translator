/// <reference types="vite/client" />
/// <reference types="chrome" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USAGE_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
