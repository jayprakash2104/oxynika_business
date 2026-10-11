import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const encryptionService = inject(EncryptionService);

  const encryptedToken = sessionStorage.getItem('token');

  if (!encryptedToken) {
    return next(req);
  }

  return from(
    encryptionService.decrypt<string>(encryptedToken)
  ).pipe(
    switchMap((token) => {

      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authReq);
    })
  );
};