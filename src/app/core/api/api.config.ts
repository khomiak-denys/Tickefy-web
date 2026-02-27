const env = (import.meta as { env?: Record<string, string> }).env || {};
export const API_BASE_URL = import.meta.env.NG_APP_API_BASE_URL;
