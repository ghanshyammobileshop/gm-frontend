import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from 'app/services/user.service';
import { Observable, of } from 'rxjs';

export const AccessGuard = (permission: any) => (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const router: Router = inject(Router);
    const store = inject(UserService);

    if (!store.hasAccess(permission)) {
        return of(router.parseUrl(`forbidden`));
    }
    return of(true);
};