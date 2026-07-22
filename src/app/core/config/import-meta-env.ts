// @ngx-env/builder exposes all APP_* variables from .env as a global _NGX_ENV_ object.
// It is always defined by the builder before the app boots.
declare const _NGX_ENV_: Record<string, string>;

export const rawImportMetaEnv = _NGX_ENV_;
