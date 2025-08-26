import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmPopupComponent } from 'app/components/confirm-popup/confirm-popup.component';
import { DeleteConfirmComponent } from 'app/components/delete-confirm/delete-confirm.component';
import { AccessControls } from 'app/const';
import { AccessControlCategory, User } from 'app/models/user';
import { AppUserService } from 'app/services/app-user.service';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';

@Component({
	selector: 'app-view-admin-user',
	templateUrl: './view-admin-user.component.html',
	styleUrl: './view-admin-user.component.scss'
})
export class ViewAdminUserComponent implements OnInit {

	accessControlsList = AccessControls;
	accessControls: AccessControlCategory[] = [];

	adminUser?: User | null = null;
	adminUserId!: string;

	urlParams: any = null;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _adminUserService: AppUserService,
		public _userService: UserService,
		public _authService: AuthService,
		private _utilService: UtilService,
		private _dialog: MatDialog,
	) {

	}

	ngOnInit(): void {
		this._activatedRoute.paramMap.subscribe((params) => {
			this.adminUserId = params.get('id') ?? '';
			this.loadPreData();
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	async loadPreData() {
		try {
			this.adminUser = await this._adminUserService.getAdminUserById(this.adminUserId);
			const accessControls = await this._userService.getAccessControlsList();

			const tempAccess: any = [];
			accessControls.modules.map(category => {
				const cat: any = {
					category: category.category,
					accessControls: []
				}
				category.accessControls.map((accessControl: any) => {
					if (this.adminUser?.accessControls.includes(accessControl.value)) {
						cat.accessControls.push(accessControl);
					}
				});
				if (cat.accessControls.length) {
					tempAccess.push(cat);
				}
			});
			this.accessControls = tempAccess;
		} catch (error: any) {
			this._utilService.showErrorSnack(error);
		}
	}

	goTo(path: string | null) {
		if (path) {
			this._router.navigate([path], { relativeTo: this._activatedRoute, queryParams: this.urlParams });
		}
	}

	resetPassword() {
		const dialogRef = this._dialog.open(ConfirmPopupComponent, {
			data: { title: 'Are sure you want to Reset password?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				try {
					this._utilService.showErrorSnack('This feature is not implemented yet.');
				} catch (error: any) {
					this._utilService.showErrorSnack(error);
				}
			}
		});
	}

	deleteUser() {
		const dialogRef = this._dialog.open(DeleteConfirmComponent, {
			data: { title: 'Are sure you want to delete this user?' },
		});
		dialogRef.afterClosed().subscribe(async (data) => {
			if (data) {
				try {
					await this._adminUserService.deleteAdminUser(this.adminUserId);
					this._utilService.showSuccessSnack('User deleted successfully');
					this.goTo('/admin-user');
				} catch (error: any) {
					this._utilService.showErrorSnack(error);
				}
			}
		});
	}
}
