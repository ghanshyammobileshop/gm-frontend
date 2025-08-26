import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { StatisticsModel } from 'app/models/statistics';
import { AccessControlList, User } from 'app/models/user';
import { Observable, ReplaySubject, lastValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { UtilService } from './util.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    accessWithRoute: Array<any> = [
        {
            access: 'DASHBOARD_VIEW',
            route: ['dashboard']
        },

    ];

    constructor(
        private _storageService: StorageService,
        private _utilService: UtilService,
        private http: HttpClient,
    ) {
        this.observedUser();
    }

    observedUser() {
        this._utilService.loginChangeObx.subscribe((it) => {
            if (it) {
                this.user = it;
            }
        });
    }

    set user(value: User) {
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }



    hasAccess(access: string | Array<string>): Boolean {
        const user = this._storageService.getCurrentUser();
        if (user?.role == 'Super Admin') {
            return true;
        }
        if (typeof access === 'string') {
            if (user?.accessControls?.includes(access)) {
                return true;
            }
        } else {
            var hasAccess = false;
            access.map(e => {
                if (user?.accessControls?.includes(e)) {
                    hasAccess = true;
                }
            });
            return hasAccess;
        }
        return false;
    }

    getInitialRouteAccess(): string {
        const user = this._storageService.getCurrentUser();
        var route: any = null;
        this.accessWithRoute.map(e => {
            // if (user?.accessControls?.includes(e.access) && !route) {
            //     route = e.route[0];
            // }A
        });
        return route ?? 'dashboard';
    }

    getAccessControlsList(): Promise<AccessControlList> {
        return lastValueFrom(this.http.get<AccessControlList>(ApiUrls.ACCESS_CONTROLS));
    }

    getAccessControlsRoleWiseList(): Promise<any> {
        return lastValueFrom(this.http.get<any>(ApiUrls.ACCESS_CONTROLS_ROLE_WISE));
    }

    getStatistics(): Promise<StatisticsModel> {
        return lastValueFrom(this.http.get<StatisticsModel>(ApiUrls.STATISTICS));
    }
}
