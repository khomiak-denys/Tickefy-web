const env = (import.meta as { env?: Record<string, string> }).env || {};

export const JWT_ISSUER = env['NG_APP_JWT_ISSUER'] ?? '';
export const JWT_AUDIENCE = env['NG_APP_JWT_AUDIENCE'] ?? '';
