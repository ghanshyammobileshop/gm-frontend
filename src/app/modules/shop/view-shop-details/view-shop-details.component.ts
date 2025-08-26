import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmComponent } from 'app/components/delete-confirm/delete-confirm.component';
import { AccessControls } from 'app/const';
import { InvoiceTypeEnum } from 'app/models/enums/invoice.enum';
import { Shop } from 'app/models/shop.model';
import { ShopService } from 'app/services/shop.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';

@Component({
	selector: 'app-view-shop-details',
	templateUrl: './view-shop-details.component.html',
	styleUrl: './view-shop-details.component.scss'
})
export class ViewShopDetailsComponent implements OnInit {

	accessControls = AccessControls;
	shopModel?: Shop | null = null;
	shopId!: string;

	urlParams: any = null;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _shopService: ShopService,
		private _utilService: UtilService,
		public _userService: UserService,
		private _dialog: MatDialog,
	) {

	}

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.shopId = params.get('id') ?? '';
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	async loadPreData() {
		try {
			this.shopModel = await this._shopService.getShopById(this.shopId);
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	get isTaxInvoiceType() {
		return this.shopModel?.invoiceType == InvoiceTypeEnum.TAX_INVOICE;
	}

	goTo(path: string | null) {
		if (path) {
			this._router.navigate([path], { relativeTo: this._activatedRoute, queryParams: this.urlParams });
		}
	}

	deleteShop() {
		const dialogRef = this._dialog.open(DeleteConfirmComponent, {
			data: { title: 'Are sure you want to delete this shop?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				try {
					await this._shopService.deleteShop(this.shopId);
					this._utilService.showSuccessSnack('Shop deleted successfully');
					this.goTo('/shop');
				} catch (error: any) {
					this._utilService.showErrorSnack(error);
				}
			}
		});
	}
}
