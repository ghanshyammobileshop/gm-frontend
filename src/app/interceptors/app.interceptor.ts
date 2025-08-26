import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { UtilService } from 'app/services/util.service';
import { Utils } from 'app/utils';
import { Observable, catchError, finalize, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const appInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const utilService = inject(UtilService);
    const authService = inject(AuthService);
    const storageService = inject(StorageService);
    const _router = inject(Router);

    const authToken = storageService.getSessionToken();
    if (authToken && !Utils.isTokenExpired(authToken)) {
        req = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });
    }
    utilService.showLoader();

    return next(req).pipe(
        catchError((error: any) => {
            if (error instanceof HttpErrorResponse) {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    authService.signOut();
                    _router.navigate(['sign-in']);
                }
            }
            return throwError(() => error);
        }),
        finalize(() => utilService.hideLoader())
    );
};
