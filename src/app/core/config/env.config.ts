import { z } from 'zod';
import { rawImportMetaEnv } from './import-meta-env';

const envSchema = z.object({
  NG_APP_JWT_ISSUER: z.string().min(1),
  NG_APP_JWT_AUDIENCE: z.string().min(1),
  NG_APP_API_BASE_URL: z.string().min(1),
});

const parsed = envSchema.safeParse(rawImportMetaEnv ?? {});

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const appEnv = parsed.data;
