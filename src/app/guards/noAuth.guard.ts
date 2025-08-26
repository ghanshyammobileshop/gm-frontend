import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { of, switchMap } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const userService = inject(UserService)

    return inject(AuthService).check().pipe(
        switchMap((authenticated) => {
            if (authenticated) {
                const initRoute = userService.getInitialRouteAccess();
                return of(router.parseUrl(initRoute));
            }
            return of(true);
        }),
    );
};
