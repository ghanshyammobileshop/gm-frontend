import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { PaginationResponse } from 'app/models/pagination-response';
import { User } from 'app/models/user';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppUserService {

    constructor(
        private http: HttpClient,
    ) { }

    getAdminUserList(params: HttpParams): Promise<PaginationResponse<User>> {
        return lastValueFrom(this.http.get<PaginationResponse<User>>(ApiUrls.ADMIN_USER_LIST, { params }));
    }

    createAdminUser(payload: User): Promise<User> {
        return lastValueFrom(this.http.post<User>(ApiUrls.ADMIN_USER, payload));
    }

    updateAdminUser(payload: any): Promise<User> {
        return lastValueFrom(this.http.patch<User>(`${ApiUrls.ADMIN_USER}`, payload));
    }

    deleteAdminUser(userId: string): Promise<User> {
        return lastValueFrom(this.http.delete<User>(`${ApiUrls.ADMIN_USER}/${userId}`));
    }

    getAdminUserById(userId: string): Promise<User> {
        return lastValueFrom(this.http.get<User>(`${ApiUrls.ADMIN_USER_FIND_BY_ID}/${userId}`));
    }

    getRoleList(): Promise<string[]> {
        return lastValueFrom(this.http.get<string[]>(`${ApiUrls.ADMIN_USER_ROLE_LIST}`));
    }
}
