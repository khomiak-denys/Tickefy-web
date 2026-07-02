import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(AuthService);
  const token = service.getAccessToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        return service.refreshToken().pipe(
          switchMap((result) => {
            service.saveToken(result.token);
            const refreshedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${result.token}` },
            });
            return next(refreshedReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
