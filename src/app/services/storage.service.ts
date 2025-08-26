import { Injectable } from '@angular/core';
import { StorageConst } from 'app/config';
import { User } from 'app/models/user';

@Injectable({
	providedIn: 'root'
})
export class StorageService {

	storageApi = window.localStorage // sessionStorage;

	constructor() { }

	getItem(key: string): any {
		let item = this.storageApi.getItem(key);
		return item ? JSON.parse(item) : null
	}

	setItem(key: string, value: any) {
		this.storageApi[key] = JSON.stringify(value);
	}

	removeItem(key: string) {
		this.storageApi.removeItem(key);
	}

	getSessionToken(): string | null {
		return this.getItem(StorageConst.TOKEN);
	}

	setSessionToken(token: string) {
		this.setItem(StorageConst.TOKEN, token);
	}

	setCurrentUser(user: User) {
		this.setItem(StorageConst.CURRENT_USER, user);
	}

	setCurrentShopAccess(shopId: string) {
		this.setItem(StorageConst.CURRENT_SHOP_ACCESS, shopId);
	}

	getCurrentShopAccess(): string | null {
		return this.getItem(StorageConst.CURRENT_SHOP_ACCESS);
	}

	getCurrentUser(): User | null {
		return this.getItem(StorageConst.CURRENT_USER);
	}

	clearLocalStorage() {
		this.storageApi.removeItem(StorageConst.CURRENT_USER);
		this.storageApi.removeItem(StorageConst.CURRENT_SHOP_ACCESS);
		this.storageApi.removeItem(StorageConst.TOKEN);
	}
}
