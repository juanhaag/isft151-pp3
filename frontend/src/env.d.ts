/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_API_VERSION: string;
  readonly PUBLIC_APP_NAME: string;
  readonly PUBLIC_APP_DESCRIPTION: string;
  readonly PUBLIC_ENABLE_WEATHER: string;
  readonly PUBLIC_ENABLE_AI_REPORTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
