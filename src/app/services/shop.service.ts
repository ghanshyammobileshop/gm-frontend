import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrls } from 'app/config';
import { Shop, ShopDropdownList } from 'app/models/shop.model';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShopService {

    constructor(
        private http: HttpClient,
    ) { }

    getShopDropdown(): Promise<ShopDropdownList[]> {
        return lastValueFrom(this.http.get<ShopDropdownList[]>(ApiUrls.SHOP_DROPDOWN_LIST));
    }

    getShopListByAccess(): Promise<ShopDropdownList[]> {
        return lastValueFrom(this.http.get<ShopDropdownList[]>(ApiUrls.SHOP_BY_ACCESS_LIST));
    }

    getAllShop(params: HttpParams): Promise<Shop[]> {
        return lastValueFrom(this.http.get<Shop[]>(ApiUrls.ALL_SHOP_LIST, { params }));
    }

    getShopById(shopId: string): Promise<Shop> {
        return lastValueFrom(this.http.get<Shop>(`${ApiUrls.SHOP}/${shopId}`));
    }

    createShop(payload: Shop): Promise<Shop> {
        return lastValueFrom(this.http.post<Shop>(ApiUrls.SHOP, payload));
    }

    updateShop(payload: any): Promise<Shop> {
        return lastValueFrom(this.http.patch<Shop>(`${ApiUrls.SHOP}`, payload));
    }

    deleteShop(shopId: string): Promise<Shop> {
        return lastValueFrom(this.http.delete<Shop>(`${ApiUrls.SHOP}/${shopId}`));
    }
}
