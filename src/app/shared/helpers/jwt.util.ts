import { JwtPayload } from "./dto/jwt.payload"

function isJwtPayload(v: unknown): v is JwtPayload {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o["nameid"] === "string" &&
    typeof o["name"] === "string" &&
    typeof o["roles"] === "string" &&
    typeof o["nbf"] === "number" &&
    typeof o["exp"] === "number" &&
    typeof o["iat"] === "number" &&
    typeof o["iss"] === "string" &&
    typeof o["aud"] === "string"
  );
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=');
    const parsed: unknown = JSON.parse(atob(padded));
    return isJwtPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
