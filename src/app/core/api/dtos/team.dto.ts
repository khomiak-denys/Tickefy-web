import { Category } from './category.enum';
import { UserShortDto } from './user.dto';

export interface CreateTeamRequest {
  name: string | null;
  description: string | null;
  category: Category | null;
}

export interface TeamSummary {
  id: string;
  name: string | null;
  category: string | null;
  manager: UserShortDto | null;
}

export interface TeamDetails extends TeamSummary {
  description: string | null;
  members: UserShortDto[];
}
