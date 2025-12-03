export enum Category {
  Category0 = 0,
  Category1 = 1,
  Category2 = 2,
  Category3 = 3,
  Category4 = 4,
  Category5 = 5,
  Category6 = 6,
  Category7 = 7,
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
