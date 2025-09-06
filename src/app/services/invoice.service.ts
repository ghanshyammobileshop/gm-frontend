import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { Invoice } from 'app/models/invoice';
import { PaginationResponse } from 'app/models/pagination-response';
import printJS from "print-js";
import { lastValueFrom } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class InvoiceService {

    constructor(
        private http: HttpClient,
        private _storageService: StorageService,
    ) { }

    getInvoiceList(params: HttpParams): Promise<PaginationResponse<Invoice>> {
        return lastValueFrom(this.http.get<PaginationResponse<Invoice>>(ApiUrls.INVOICE_LIST, { params }));
    }

    getInvoiceListByCustomerAndShop(option: { customerId: string, shopId: string }): Promise<PaginationResponse<Invoice>> {
        let params = new HttpParams();
        params = params.append('customerId', option.customerId);
        params = params.append('shopId', option.shopId);
        return lastValueFrom(this.http.get<PaginationResponse<Invoice>>(`${ApiUrls.INVOICE_BY_CUSTOMER_AND_SHOP}`, { params }));
    }

    getInvoiceById(invoiceId: string): Promise<Invoice> {
        return lastValueFrom(this.http.get<Invoice>(`${ApiUrls.INVOICE}/${invoiceId}`));
    }

    getLatestInvoiceNo(shopId: string): Promise<any> {
        return lastValueFrom(this.http.get<any>(`${ApiUrls.INVOICE_LATEST_NO_BY_SHOP_ID}/${shopId}`));
    }

    createInvoice(payload: any): Promise<any> {
        return lastValueFrom(this.http.post<any>(ApiUrls.INVOICE, payload));
    }

    updateInvoice(payload: any): Promise<any> {
        return lastValueFrom(this.http.patch<any>(`${ApiUrls.INVOICE}`, payload));
    }

    deleteInvoiceById(invoiceId: string): Promise<Invoice> {
        return lastValueFrom(this.http.delete<Invoice>(`${ApiUrls.INVOICE}/${invoiceId}`));
    }

    async printInvoice(invoiceId: string) {
        const headers = new HttpHeaders().set(
            'authorization',
            'Bearer ' + this._storageService.getSessionToken()
        );
        const response: HttpResponse<Blob> = await lastValueFrom(
            this.http.get(`${ApiUrls.INVOICE_PRINT}/${invoiceId}`, {
                headers,
                responseType: 'blob',
                observe: 'response',
            }));
        const fileUrl = window.URL.createObjectURL(response.body ?? new Blob());
        printJS(fileUrl);
    }
}
