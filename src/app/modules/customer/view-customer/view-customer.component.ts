import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmComponent } from 'app/components/delete-confirm/delete-confirm.component';
import { AccessControls } from 'app/const';
import { Customer } from 'app/models/customer';
import { Invoice } from 'app/models/invoice';
import { CustomerService } from 'app/services/customer.service';
import { InvoiceService } from 'app/services/invoice.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { ConfirmPopupComponent } from '../../../components/confirm-popup/confirm-popup.component';

@Component({
	selector: 'app-view-customer',
	templateUrl: './view-customer.component.html',
	styleUrl: './view-customer.component.scss'
})
export class ViewCustomerComponent {

	accessControls = AccessControls;
	customerId: string | null = null;
	customer: Customer | null = null;
	displayedColumns: string[] = ['invoiceNo', 'invoiceDate', 'companyName', 'modelNo', 'invoiceTotal', 'shopInfo', 'createdBy', 'updatedBy'];
	dataSource = new MatTableDataSource<Invoice>();
	urlParams: any = null;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _utilService: UtilService,
		private _customerService: CustomerService,
		private _invoiceService: InvoiceService,
		private _dialog: MatDialog,
		public _userService: UserService,
	) {
	}

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.customerId = params.get('id') ?? '';
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	async loadPreData() {
		try {
			if (this.customerId) {
				this.customer = await this._customerService.getCustomerById(this.customerId);
				let invoices = await this._invoiceService.getInvoiceListByCustomerAndShop({
					customerId: this.customer.id,
					shopId: this.customer.shopId,
				});
				this.dataSource.data = invoices.items;
			}
		} catch (error: any) {
			console.error(error);
			this._utilService.showErrorSnack(error);
		}
	}

	goTo(path: string | null) {
		if (path) {
			this._router.navigate([path], { relativeTo: this._activatedRoute, queryParams: this.urlParams });
		}
	}

	goToCreateInvoice() {
		const params: any = this._utilService.decode(this.urlParams.q);
		const newUrlParams = { customerId: this.customerId, ...params };
		this._router.navigate(
			['/invoice/form'],
			{
				relativeTo: this._activatedRoute,
				queryParams: { q: this._utilService.encode(newUrlParams) }
			}
		);
	}

	editConfirm() {
		const dialogRef = this._dialog.open(ConfirmPopupComponent, {
			data: { title: 'Are sure you want to edit this customer details?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				this.goTo('/customer/form/' + this.customerId);
			}
		});
	}

	deleteCustomer() {
		const dialogRef = this._dialog.open(DeleteConfirmComponent, {
			data: { title: 'Are sure you want to delete this Customer?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				try {
					await this._customerService.deleteCustomer(this.customerId!);
					this._utilService.showSuccessSnack('Customer deleted successfully');
					this.goTo('/customer');
				} catch (error: any) {
					this._utilService.showErrorSnack(error);
				}
			}
		});
	}
}
