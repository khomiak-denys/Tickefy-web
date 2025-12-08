export function decodeJwtPayload(token: string): any | undefined {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return undefined;
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

export function extractRoleFromPayload(payload: any): string | undefined {
  if (!payload) return undefined;
  const msClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const role = payload.role || payload.userRole || payload[msClaim];
  if (Array.isArray(payload.roles) && payload.roles.length) return String(payload.roles[0]);
  if (Array.isArray(role) && role.length) return String(role[0]);
  if (role) return String(role);
  return undefined;
}

export function extractNamesFromPayload(payload: any): { firstName?: string; lastName?: string } {
  if (!payload) return {};
  const firstName = payload.given_name || payload.firstName || payload.givenName;
  const lastName = payload.family_name || payload.lastName || payload.familyName;
  if (firstName || lastName) return { firstName: String(firstName || ''), lastName: String(lastName || '') };
  // Fallback: split name
  const name: string | undefined = payload.name;
  if (name) {
    const parts = String(name).trim().split(/\s+/);
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }
  return {};
}
