/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional sub-directory the static build is served from (GitHub Pages). */
  readonly VITE_BASE_PATH?: string;
  /** Optional URL of a developer-run AI proxy. Unset => offline assistant. */
  readonly VITE_AI_PROXY_URL?: string;
  /** Optional model label shown in the UI. */
  readonly VITE_AI_MODEL_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
