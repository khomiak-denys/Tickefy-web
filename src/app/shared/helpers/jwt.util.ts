import { JwtPayload } from './dto/jwt.payload';
import { JwtPayloadSchema } from './dto/jwt.payload.schema';
import { TokenValidationOptions } from './dto/token.validation.options';

export function validateJwtClaims(
  payload: JwtPayload,
  options: TokenValidationOptions
): { valid: boolean; reason: string | null } {
  const now = Date.now() / 1000;

  if (now > payload.exp) {
    return { valid: false, reason: 'Token expired' };
  }

  if (now < payload.nbf) {
    return { valid: false, reason: 'Token not valid before specific time' };
  }

  if (options.iss && options.iss !== payload.iss) {
    return { valid: false, reason: 'Invalid issuer' };
  }

  if (options.aud && options.aud !== payload.aud) {
    return { valid: false, reason: 'Invalid audience' };
  }

  return { valid: true, reason: null };
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4 || 4)) % 4), '=');
    const parsed = JSON.parse(atob(padded));

    const result = JwtPayloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
