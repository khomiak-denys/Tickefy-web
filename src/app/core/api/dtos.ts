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

export interface TicketCommentDto {
  id: string;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  content?: string | null;
  created: string; // ISO date
}

export interface TicketSummaryDto {
  id: string;
  title?: string | null;
  description?: string | null;
  requester?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  assignedTeam?: {
    id: string;
    name?: string | null;
    category?: string | null;
    manager?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  };
  assignedAgent?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  deadline: string; // ISO date
}

export interface TicketDetailsDto extends TicketSummaryDto {
  comments?: TicketCommentDto[] | null;
  attachments?: Array<{
    filePath?: string | null;
    fileName?: string | null;
    contentType?: string | null;
    sizeBytes: number;
  }> | null;
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

