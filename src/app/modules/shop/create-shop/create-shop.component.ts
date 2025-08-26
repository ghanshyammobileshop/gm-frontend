import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceTypeEnum } from 'app/models/enums/invoice.enum';
import { Shop } from 'app/models/shop.model';
import { ShopService } from 'app/services/shop.service';
import { UtilService } from 'app/services/util.service';
import { cloneDeep } from 'lodash';

@Component({
	selector: 'app-create-shop',
	templateUrl: './create-shop.component.html',
	styleUrl: './create-shop.component.scss'
})
export class CreateShopComponent implements OnInit {

	shopForm!: FormGroup;
	currentShopId: string | null = null;
	currentShop: Shop | null = null;
	submitEnable: boolean = true;
	urlParams: any = null;
	invoiceTypeEnum: typeof InvoiceTypeEnum = InvoiceTypeEnum;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _fb: FormBuilder,
		private _router: Router,
		private _utilService: UtilService,
		private _shopService: ShopService,
	) { }

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.currentShopId = params.get('id');
			this.initializeForm();
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	initializeForm() {
		this.shopForm = this._fb.group({
			name: new FormControl(null, [Validators.required]),
			invoiceType: new FormControl(null, [Validators.required]),
			invoicePrefix: new FormControl(null),
			gstNo: new FormControl(null),
			cgst: new FormControl(null),
			sgst: new FormControl(null),
			description: new FormControl(null),
			termsAndConditions: new FormControl(null),
			active: new FormControl(true),
		});
	}

	get f() {
		return this.shopForm.controls;
	}

	get isTaxInvoiceType() {
		return this.shopForm.controls.invoiceType.value == InvoiceTypeEnum.TAX_INVOICE;
	}

	async loadPreData() {
		try {
			if (this.currentShopId) {
				this.currentShop = await this._shopService.getShopById(this.currentShopId);
				this.shopForm.patchValue({
					name: this.currentShop.name,
					invoiceType: this.currentShop.invoiceType,
					gstNo: this.currentShop.gstNo,
					cgst: this.currentShop.cgst,
					sgst: this.currentShop.sgst,
					invoicePrefix: this.currentShop.invoicePrefix,
					description: this.currentShop.description,
					termsAndConditions: this.currentShop.termsAndConditions,
					active: this.currentShop.active,
				});
			}
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	async onSubmit() {
		if (this.shopForm.invalid) {
			this.shopForm.markAllAsTouched();
			return;
		}

		var payload = cloneDeep(this.shopForm.value);

		try {
			this.submitEnable = false;
			let resp: any;
			if (this.currentShopId) {
				payload.id = this.currentShopId;
				resp = await this._shopService.updateShop(payload);
			} else {
				resp = await this._shopService.createShop(payload);
			}
			this._utilService.showSuccessSnack(resp.message);
			this.backToList();
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		} finally {
			this.submitEnable = true;
		}
	}

	backToList(): void {
		this._router.navigate(['/shop'], { queryParams: this.urlParams });
	}
}
