import { z } from 'zod';
import { rawImportMetaEnv } from './import-meta-env';

const envSchema = z.object({
  NG_APP_JWT_ISSUER: z.string().min(1).default('tickefy'),
  NG_APP_JWT_AUDIENCE: z.string().min(1).default('tickefy-web'),
  NG_APP_API_BASE_URL: z.string().url().default('http://localhost:5000'),
});

const rawEnv = rawImportMetaEnv ?? {};
const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const appEnv = parsed.data;
