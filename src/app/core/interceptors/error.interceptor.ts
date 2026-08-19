import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { ProblemDetails } from '../api/dtos/error.dto';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const problem = error.error as ProblemDetails;
      const isValidation = error.status === 400 && problem.errors;
      if (isValidation) {
        Object.values(problem.errors!).forEach((messages: string[]) => {
          messages.forEach((message) => notificationService.error(message));
        });
      } else {
        notificationService.error(problem.detail || problem.title || 'An error occurred');
      }
      return throwError(() => error);
    })
  );
};
