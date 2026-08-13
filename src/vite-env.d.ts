/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_ID?: string;
  readonly VITE_COMMIT_SHA?: string;
  readonly VITE_DEPLOY_TARGET?: "portable" | "github-pages" | "platea";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
