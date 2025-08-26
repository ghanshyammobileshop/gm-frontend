import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { Customer } from 'app/models/customer';
import { PaginationResponse } from 'app/models/pagination-response';
import { User } from 'app/models/user';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {

    constructor(
        private http: HttpClient,
    ) { }

    getCustomerList(params: HttpParams): Promise<PaginationResponse<Customer>> {
        return lastValueFrom(this.http.get<PaginationResponse<Customer>>(ApiUrls.CUSTOMER_FIND_ALL, { params }));
    }

    createCustomer(payload: User): Promise<Customer> {
        return lastValueFrom(this.http.post<Customer>(ApiUrls.CUSTOMER, payload));
    }

    updateCustomer(payload: any): Promise<Customer> {
        return lastValueFrom(this.http.patch<Customer>(`${ApiUrls.CUSTOMER}`, payload));
    }

    getCustomerById(id: string): Promise<Customer> {
        return lastValueFrom(this.http.get<Customer>(`${ApiUrls.CUSTOMER}/${id}`));
    }

    getRoleList(): Promise<string[]> {
        return lastValueFrom(this.http.get<string[]>(`${ApiUrls.ADMIN_USER_ROLE_LIST}`));
    }

    deleteCustomer(customerId: string): Promise<Customer> {
        return lastValueFrom(this.http.delete<Customer>(`${ApiUrls.CUSTOMER}/${customerId}`));
    }
}
