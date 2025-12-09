export interface RegisterUserRequest {
  firstName?: string | null;
  lastName?: string | null;
  login?: string | null;
  password?: string | null;
}

export interface LoginUserRequest {
  login?: string | null;
  password?: string | null;
}

export interface SetPasswordRequest {
  oldPassword?: string | null;
  newPassword?: string | null;
}

export interface SetUserRoleRequest {
  role: string | null;
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
}
