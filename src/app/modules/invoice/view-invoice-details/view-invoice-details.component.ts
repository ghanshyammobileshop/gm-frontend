import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmComponent } from 'app/components/delete-confirm/delete-confirm.component';
import { AccessControls } from 'app/const';
import { InvoiceTypeEnum } from 'app/models/enums/invoice.enum';
import { Invoice } from 'app/models/invoice';
import { InvoiceService } from 'app/services/invoice.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';

@Component({
	selector: 'app-view-invoice-details',
	templateUrl: './view-invoice-details.component.html',
	styleUrl: './view-invoice-details.component.scss'
})
export class ViewInvoiceDetailsComponent implements OnInit {

	accessControls = AccessControls;
	invoiceModel?: Invoice | null = null;
	invoiceId!: string;
	urlParams: any = null;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _invoiceService: InvoiceService,
		private _utilService: UtilService,
		public _userService: UserService,
		private _dialog: MatDialog,
	) {

	}

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.invoiceId = params.get('id') ?? '';
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	async loadPreData() {
		try {
			this.invoiceModel = await this._invoiceService.getInvoiceById(this.invoiceId);
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	get isTaxInvoiceType() {
		return this.invoiceModel?.invoiceType == InvoiceTypeEnum.TAX_INVOICE;
	}

	goTo(path: string | null) {
		if (path) {
			this._router.navigate([path], { relativeTo: this._activatedRoute, queryParams: this.urlParams });
		}
	}

	deleteInvoice() {
		const dialogRef = this._dialog.open(DeleteConfirmComponent, {
			data: { title: 'Are sure you want to delete this invoice?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				try {
					await this._invoiceService.deleteInvoiceById(this.invoiceId);
					this._utilService.showSuccessSnack('Invoice deleted successfully');
					this.goTo('/invoice');
				} catch (error: any) {
					this._utilService.showErrorSnack(error);
				}
			}
		});
	}

	async onPrint() {
		if (this.invoiceId) {
			await this._invoiceService.printInvoice(this.invoiceId);
		}
	}
}
