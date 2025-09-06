import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { AccessControls } from 'app/const';
import { Customer } from 'app/models/customer';
import { InvoiceTypeEnum } from 'app/models/enums/invoice.enum';
import { Invoice } from 'app/models/invoice';
import { Shop } from 'app/models/shop.model';
import { CustomerService } from 'app/services/customer.service';
import { InvoiceService } from 'app/services/invoice.service';
import { ShopService } from 'app/services/shop.service';
import { UtilService } from 'app/services/util.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {

  accessControls = AccessControls;
  invoiceForm!: FormGroup;
  submitEnable: boolean = true;
  invoiceId: string | null = null;
  invoice: Invoice | null = null;
  urlParams: any = null;
  customerId: string | null = null;
  shop: Shop | null = null;
  customer: Customer | null = null;
  invoiceTypeEnum: typeof InvoiceTypeEnum = InvoiceTypeEnum;
  onDestroy = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private _utilService: UtilService,
    private _invoiceService: InvoiceService,
    private _shopService: ShopService,
    public _location: Location,
    private _customerService: CustomerService,
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();

    this._activatedRoute.paramMap
      .pipe(takeUntil(this.onDestroy))
      .subscribe((params) => {
        this.invoiceId = params.get('id');
      });

    this._activatedRoute.queryParams
      .pipe(takeUntil(this.onDestroy))
      .subscribe((p) => {
        const params: any = this._utilService.decode(p.q);
        this.urlParams = params;
        this.customerId = this.urlParams['customerId'];
      });

    this.loadPreData();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  initializeForm() {
    this.invoiceForm = this._fb.group({
      invoiceNo: new FormControl(null, [Validators.required]),
      invoiceType: new FormControl(null, [Validators.required]),
      invoiceDate: new FormControl(moment().toISOString(), [Validators.required]),
      invoicePrefix: new FormControl(null),
      subTotal: new FormControl(0),
      sgstTotal: new FormControl(0),
      cgstTotal: new FormControl(0),
      invoiceTotal: new FormControl(0),
      companyName: new FormControl(null, [Validators.required]),
      modelNo: new FormControl(null, [Validators.required]),
      serialNo1: new FormControl(null),
      serialNo2: new FormControl(null),
      hsnCode: new FormControl(null),
      quantity: new FormControl(1, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      total: new FormControl(0),
      roundingOff: new FormControl(0),
      customerId: new FormControl(null, [Validators.required]),
      shopId: new FormControl(null, [Validators.required]),
    });

    this.invoiceForm.get('quantity')?.valueChanges
      .pipe(takeUntil(this.onDestroy), debounceTime(200), distinctUntilChanged(),)
      .subscribe((_value) => {
        this.calculateTotal();
      });

    this.invoiceForm.get('price')?.valueChanges
      .pipe(takeUntil(this.onDestroy), debounceTime(200), distinctUntilChanged(),)
      .subscribe((_value) => {
        this.calculateTotal();
      });
  }

  get f() {
    return this.invoiceForm.controls;
  }

  get isTaxInvoiceType() {
    return this.invoiceForm.controls.invoiceType.value == InvoiceTypeEnum.TAX_INVOICE;
  }

  onChangeInvoiceType(_event: MatSelectChange) {
    this.calculateTotal();
  }

  calculateTotal() {
    let quantity = this.invoiceForm.get('quantity')?.value ?? 0;
    let price = this.invoiceForm.get('price')?.value ?? 0;

    if (this.isTaxInvoiceType && this.shop) {
      const total = quantity * price;
      this.invoiceForm.get('total')?.setValue(total);

      const sgstTotal = (total * this.shop.sgst) / 100;
      const cgstTotal = (total * this.shop.cgst) / 100;
      const subTotal = total + sgstTotal + cgstTotal;
      const invoiceTotal = Math.round(subTotal);
      const roundingOff = invoiceTotal - subTotal;

      this.invoiceForm.get('cgstTotal')?.setValue(cgstTotal);
      this.invoiceForm.get('sgstTotal')?.setValue(sgstTotal);
      this.invoiceForm.get('subTotal')?.setValue(subTotal);
      this.invoiceForm.get('roundingOff')?.setValue(roundingOff);
      this.invoiceForm.get('invoiceTotal')?.setValue(invoiceTotal);
    } else {
      const total = quantity * price;
      this.invoiceForm.get('total')?.setValue(total);
      const subTotal = total;
      const invoiceTotal = Math.round(subTotal);
      const roundingOff = invoiceTotal - subTotal;

      this.invoiceForm.get('subTotal')?.setValue(subTotal);
      this.invoiceForm.get('roundingOff')?.setValue(roundingOff);
      this.invoiceForm.get('invoiceTotal')?.setValue(invoiceTotal);
    }
  }

  async loadPreData() {
    try {
      if (this.invoiceId) {
        this.invoice = await this._invoiceService.getInvoiceById(this.invoiceId)
        this.shop = await this._shopService.getShopById(this.invoice.shopId);
        this.customer = await this._customerService.getCustomerById(this.invoice.customerId);
        this.invoiceForm.patchValue(this.invoice);
      } else {
        let shopId: string | null = null;

        if (this.customerId) {
          this.customer = await this._customerService.getCustomerById(this.customerId);
          shopId = this.customer.shopId;
        }

        if (shopId) {
          this.shop = await this._shopService.getShopById(shopId);
          const newInvoiceNo = await this._invoiceService.getLatestInvoiceNo(shopId);
          this.invoiceForm.patchValue({
            invoiceType: this.shop?.invoiceType,
            invoicePrefix: this.shop?.invoicePrefix,
            invoiceNo: newInvoiceNo?.expectedInvoiceNo,
            customerId: this.customerId,
            shopId: shopId,
          });
        }
      }

    } catch (error: any) {
      this._utilService.showErrorSnack(error);
    }
  }

  async onSave() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    try {
      this.submitEnable = false;
      let response;
      if (this.invoiceId) {
        var payload = cloneDeep(this.invoiceForm.value);
        payload.id = this.invoiceId;
        response = await this._invoiceService.updateInvoice(payload);
      } else {
        response = await this._invoiceService.createInvoice(this.invoiceForm.value);
        this.invoiceId = response?.invoice?.id;
      }
      this._utilService.showSuccessSnack(response?.message ?? '');
    } catch (error: any) {
      this._utilService.showErrorSnack(error);
    } finally {
      this.submitEnable = true;
    }

  }

  async onPrint() {
    if (this.invoiceId) {
      try {
        await this._invoiceService.printInvoice(this.invoiceId);
      } catch (error) {
        this._utilService.showErrorSnack(error);
      }
    }
  }
}
