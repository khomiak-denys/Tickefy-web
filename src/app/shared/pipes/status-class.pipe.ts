import { Pipe, PipeTransform } from '@angular/core';
import { statusClass } from '../helpers/ticket.utils';

@Pipe({
  name: 'statusClass',
  standalone: true,
  pure: true,
})
export class StatusClassPipe implements PipeTransform {
  transform(status: string | null | undefined) {
    return statusClass(status || '');
  }
}
