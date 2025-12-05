// Matches Tickefy.Domain.Common.Category
export enum Category {
  Finance = 0,
  IT = 1,
  Design = 2,
  Marketing = 3,
  HumanResources = 4,
  Legal = 5,
  AccessAndSecurity = 6,
  Other = 7,
}

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

export interface CreateTeamRequest {
  name?: string | null;
  description?: string | null;
  category?: Category;
}

export interface CreateTicketRequest {
  title?: string | null;
  description?: string | null;
  deadline: string; // ISO date-time string
}

export interface PostCommentRequest {
  content?: string | null;
}

export interface SetUserRoleRequest {
  role: string | null;
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
}
