import { Category } from './category.enum';

export interface CreateTeamRequest {
  name?: string | null;
  description?: string | null;
  category?: Category;
}

export interface TeamSummary {
  id: string;
  name?: string | null;
  category?: string | null;
  manager?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}
