import { rawImportMetaEnv } from '../config/import-meta-env';

export const JWT_ISSUER = rawImportMetaEnv.NG_APP_JWT_ISSUER ?? 'Tickefy.API';
export const JWT_AUDIENCE = rawImportMetaEnv.NG_APP_JWT_AUDIENCE ?? 'Tickefy.Client';
