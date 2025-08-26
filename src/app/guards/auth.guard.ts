import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (_route, state) => {
    const router: Router = inject(Router);

    return inject(AuthService).check().pipe(
        switchMap((authenticated) => {
            if (!authenticated) {
                const urlTree = router.parseUrl(`sign-in`);
                return of(urlTree);
            }
            return of(true);
        }),
    );
};
