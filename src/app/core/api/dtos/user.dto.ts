import { TeamSummary } from './team.dto';

export interface RegisterUserRequest {
  firstName: string | null;
  lastName: string | null;
  login: string | null;
  password: string | null;
}

export interface LoginUserRequest {
  login: string | null;
  password: string | null;
}

export interface SetPasswordRequest {
  oldPassword: string | null;
  newPassword: string | null;
}

export interface SetUserRoleRequest {
  role: string | null;
}

export interface UpdateProfileRequest {
  firstName: string | null;
  lastName: string | null;
}

export interface UserShortDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface UserDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  login: string;
  role: string;
  team: TeamSummary | null;
  created: string;
}
