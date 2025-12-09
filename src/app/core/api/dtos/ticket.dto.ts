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
  created?: string; // ISO date
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

export interface CreateTicketRequest {
  title?: string | null;
  description?: string | null;
  deadline: string; // ISO date-time string
}

export interface PostCommentRequest {
  content?: string | null;
}
