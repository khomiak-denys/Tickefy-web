import { Pipe, PipeTransform } from '@angular/core';
import { priorityClass } from '../helpers/ticket.utils';

@Pipe({
  name: 'priorityClass',
  standalone: true,
  pure: true,
})
export class PriorityClassPipe implements PipeTransform {
  transform(value: string | null | undefined) {
    return priorityClass(value || '');
  }
}
