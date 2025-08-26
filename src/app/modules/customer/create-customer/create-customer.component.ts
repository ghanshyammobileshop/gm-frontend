import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControls } from 'app/const';
import { Customer } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { cloneDeep } from 'lodash';

@Component({
	selector: 'app-create-customer',
	templateUrl: './create-customer.component.html',
	styleUrl: './create-customer.component.scss'
})
export class CreateCustomerComponent implements OnInit {

	accessControls = AccessControls;
	userForm!: FormGroup;
	currentUserId: string | null = null;
	currentUser: Customer | null = null;
	submitEnable: boolean = true;
	urlParams: any = null;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _fb: FormBuilder,
		private _router: Router,
		private _utilService: UtilService,
		private _customerService: CustomerService,
		public _userService: UserService,
	) { }

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe(async (params) => {
			this.currentUserId = params.get('id');
			this.initializeForm();
			await this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	initializeForm() {
		this.userForm = this._fb.group({
			name: new FormControl(null, [Validators.required]),
			email: new FormControl(null, [Validators.email]),
			mobileNo1: new FormControl(null),
			mobileNo2: new FormControl(null),
			gstNo: new FormControl(null),
			active: new FormControl(true),
		});
	}

	get f() {
		return this.userForm.controls;
	}

	async loadPreData() {
		try {
			if (this.currentUserId) {
				this.currentUser = await this._customerService.getCustomerById(this.currentUserId);
				this.userForm.patchValue({
					name: this.currentUser.name,
					email: this.currentUser.email,
					mobileNo1: this.currentUser.mobileNo1,
					mobileNo2: this.currentUser.mobileNo2,
					gstNo: this.currentUser.gstNo,
					active: this.currentUser.active,
				});
			}
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	async onSubmit() {
		if (this.userForm.invalid) {
			this.userForm.markAllAsTouched();
			return;
		}

		var payload = cloneDeep(this.userForm.value);

		try {
			this.submitEnable = false;
			let resp: any;
			if (this.currentUserId) {
				payload.id = this.currentUserId;
				resp = await this._customerService.updateCustomer(payload);
			} else {
				resp = await this._customerService.createCustomer(payload);
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
		this._router.navigate(['/customer'], { queryParams: this.urlParams });
	}
}
