import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { ProblemDetails } from '../api/dtos/error.dto';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isValidation = error.status === 400;
      const problem = error.error as ProblemDetails;
      if (isValidation) {
        Object.values(problem.errors!).forEach((messages: string[]) => {
          messages.forEach((message) => notificationService.error(message));
        });
      } else {
        notificationService.error(problem.detail ?? '');
      }
      return throwError(() => error);
    })
  );
};
