import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopDropdownList } from 'app/models/shop.model';
import { AccessControlCategory, User } from 'app/models/user';
import { AppUserService } from 'app/services/app-user.service';
import { ShopService } from 'app/services/shop.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { cloneDeep } from 'lodash';

@Component({
	selector: 'app-create-admin-user',
	templateUrl: './create-admin-user.component.html',
	styleUrl: './create-admin-user.component.scss'
})
export class CreateAdminUserComponent implements OnInit {

	userForm!: FormGroup;
	currentUserId: string | null = null;
	currentUser: User | null = null;
	roles: string[] = [];
	submitEnable: boolean = true;
	urlParams: any = null;
	shopDropdown: ShopDropdownList[] | null = null;
	accessControls: AccessControlCategory[] = [];
	accessControlsRoleWise: any = [];

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _fb: FormBuilder,
		private _router: Router,
		private _utilService: UtilService,
		public _userService: UserService,
		private _shopService: ShopService,
		private _adminUserService: AppUserService,
	) { }

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.currentUserId = params.get('id');
			this.initializeForm();
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	initializeForm() {
		this.userForm = this._fb.group({
			name: new FormControl(null, [Validators.required]),
			email: new FormControl(null, [Validators.required, Validators.email]),
			role: new FormControl(null, [Validators.required]),
			shopAccess: new FormControl(null, [Validators.required]),
			accessControls: new FormControl([]),
			active: new FormControl(true),
		});

		if (!this.currentUserId) {
			this.userForm.addControl('password', new FormControl(null, [Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@*#])[A-Za-z\\d@*#]{8,}$')]));
			this.userForm.addControl('confirmPassword', new FormControl(null, [Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@*#])[A-Za-z\\d@*#]{8,}$')]));
		}
	}

	get f() {
		return this.userForm.controls;
	}

	async loadPreData() {
		try {
			this.roles = await this._adminUserService.getRoleList();
			this.shopDropdown = await this._shopService.getShopDropdown();

			const accessControls = await this._userService.getAccessControlsList();
			this.accessControls = accessControls.modules;

			this.accessControlsRoleWise = await this._userService.getAccessControlsRoleWiseList();

			if (this.currentUserId) {
				this.currentUser = await this._adminUserService.getAdminUserById(this.currentUserId);
				this.userForm.patchValue({
					name: this.currentUser?.name,
					email: this.currentUser?.email,
					active: this.currentUser?.active,
					role: this.currentUser?.role,
					shopAccess: this.currentUser?.shopAccess ?? [],
					accessControls: this.currentUser?.accessControls ?? [],
				});
			} else {
				let currentRole = this.roles[0];
				this.userForm.patchValue({ role: currentRole });
				this.onChangeRole(currentRole);
			}
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	onChangeRole(role: string): void {
		const selectedPermissions: any = [];
		this.accessControlsRoleWise.map((e: any) => {
			if (e.role == role) {
				if (role == 'SuperAdmin') {
					this.accessControls.map(e => {
						e.accessControls.map(ac => {
							selectedPermissions.push(ac.value);
						});
					})
				} else {
					e.accessControls.map((accessControl: any) => {
						accessControl.accessControls.map((role: any) => {
							selectedPermissions.push(role.value);
						});
					});
				}
			}
		});
		this.userForm.patchValue({ accessControls: selectedPermissions });
	}

	onChangePermissionCheckBox(event: any, value: string): void {
		var selectedPermissions = cloneDeep(this.userForm.value.accessControls) ?? [];
		if (event.checked) {
			selectedPermissions.push(value);
		} else {
			selectedPermissions = selectedPermissions.filter((e: any) => e != value);
		}
		this.userForm.patchValue({ accessControls: selectedPermissions });
	}

	async onSubmit() {
		if (this.userForm.invalid) {
			this.userForm.markAllAsTouched();
			return;
		}
		if (this.currentUserId == null && this.userForm.value.password != this.userForm.value.confirmPassword) {
			this._utilService.showErrorSnack('Confirm password does not match!');
			return;
		}

		var payload = cloneDeep(this.userForm.value);
		delete payload.confirmPassword;
		if (this.currentUserId && !payload.password) {
			delete payload.password;
		}

		try {
			this.submitEnable = false;
			let resp: any;
			if (this.currentUserId) {
				payload.id = this.currentUserId;
				resp = await this._adminUserService.updateAdminUser(payload);
			} else {
				resp = await this._adminUserService.createAdminUser(payload);
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
		this._router.navigate(['/admin-user'], { queryParams: this.urlParams });
	}
}
