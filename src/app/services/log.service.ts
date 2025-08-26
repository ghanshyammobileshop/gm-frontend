import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { PaginationResponse } from 'app/models/pagination-response';
import { lastValueFrom } from 'rxjs';
import { UtilService } from './util.service';
import { ConstantsValue, Log } from 'app/models/log';

@Injectable({ providedIn: 'root' })
export class LogService {

    constructor(
        private http: HttpClient,
        private utilService: UtilService,
    ) { }

    getLogList(params: HttpParams): Promise<PaginationResponse<Log>> {
        if (params.get('from') && params.get('to')) {
            params = params.set('from', this.utilService.removeZ(params.get('from') ?? ''));
            params = params.set('to', this.utilService.removeZ(params.get('to') ?? ''));
        }
        return lastValueFrom(this.http.get<PaginationResponse<Log>>(ApiUrls.LOG, { params }));
    }

    getLogById(logId: string): Promise<Log> {
        return lastValueFrom(this.http.get<Log>(`${ApiUrls.LOG}/${logId}`));
    }

    getConstants(): Promise<ConstantsValue> {
        return lastValueFrom(this.http.get<ConstantsValue>(`${ApiUrls.LOG_CONSTANT}`));
    }
}
