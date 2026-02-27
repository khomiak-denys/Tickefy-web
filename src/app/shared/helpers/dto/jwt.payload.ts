export interface JwtPayload {
  nameid: string;
  name: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}
