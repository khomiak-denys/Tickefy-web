export interface JwtPayload {
  nameid: string;
  name: string;
  roles: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string
}
