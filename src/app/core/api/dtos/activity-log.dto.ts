import { UserShortDto } from './user.dto';

export interface ActivityLogDto {
  id: string;
  ticketId: string;
  user: UserShortDto;
  eventType: string;
  description: string;
  created: string;
}
