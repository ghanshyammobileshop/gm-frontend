import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { LoginUser } from 'app/models/login-user';
import { Utils } from 'app/utils';
import { Observable, lastValueFrom, of } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private _httpClient: HttpClient,
        private _storageService: StorageService,
    ) { }

    signIn(credentials: { email: string; password: string }): Promise<LoginUser> {
        return lastValueFrom(this._httpClient.post<LoginUser>(ApiUrls.LOGIN, credentials));
    }

    signOut() {
        this._storageService.clearLocalStorage();
    }

    check(): Observable<boolean> {

        let accessToken = this._storageService.getSessionToken();

        // Check the access token availability 
        if (!accessToken) {
            return of(false);
        }

        //and token expire date
        if (Utils.isTokenExpired(accessToken)) {
            return of(false);
        }

        return of(true);
    }
}
