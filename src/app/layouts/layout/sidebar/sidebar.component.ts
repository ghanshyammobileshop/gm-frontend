import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { AccessControls } from 'app/const';
import { User } from 'app/models/user';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { environment } from 'environments/environment';
import { MaterialModule } from '../../../material/material.module';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, MaterialModule, MatSidenavModule, RouterModule],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
	accessControls = AccessControls;
	user?: User;
	avatarInitials: string = '';
	feVersion: string = '';

	constructor(
		private _router: Router,
		public _userService: UserService,
		private _authService: AuthService,
	) {
		this.feVersion = environment.appVersion;
		this._userService.user$.subscribe(user => {
			this.user = user;
			const nameParts = this.user.name.trim().split(' ');
			const firstInitial = nameParts[0][0];
			const lastInitial = nameParts[nameParts.length - 1][0];
			this.avatarInitials = (firstInitial + lastInitial).toUpperCase();
		});
	}

	signOut(): void {
		this._authService.signOut();
		this._router.navigate(['/sign-out']);
	}
}
