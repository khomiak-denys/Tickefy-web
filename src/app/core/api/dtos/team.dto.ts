import { Category } from './category.enum';

export interface CreateTeamRequest {
  name?: string | null;
  description?: string | null;
  category?: Category;
}
