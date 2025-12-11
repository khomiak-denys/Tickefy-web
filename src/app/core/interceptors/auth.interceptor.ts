import { HttpInterceptorFn } from '@angular/common/http';

// Attaches JWT access token from localStorage to outgoing requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authReq);
};