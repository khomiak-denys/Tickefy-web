import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  nameid: z.string(),
  name: z.string(),
  role: z.string(),
  nbf: z.number(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string(),
  aud: z.string(),
});
