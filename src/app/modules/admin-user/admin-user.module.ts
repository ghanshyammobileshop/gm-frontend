import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from 'app/material/material.module';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { CreateAdminUserComponent } from './create-admin-user/create-admin-user.component';
import { ViewAdminUserComponent } from './view-admin-user/view-admin-user.component';

const routes: Routes = [
	{ path: '', component: AdminUserListComponent, canActivate: [AccessGuard(AccessControls.USER_READ_LIST)] },
	{ path: 'form', component: CreateAdminUserComponent, canActivate: [AccessGuard(AccessControls.USER_CREATE)] },
	{ path: 'form/:id', component: CreateAdminUserComponent, canActivate: [AccessGuard(AccessControls.USER_UPDATE)] },
	{ path: 'view/:id', component: ViewAdminUserComponent, canActivate: [AccessGuard(AccessControls.USER_READ_DETAILS)] },
];

@NgModule({
	declarations: [
		AdminUserListComponent,
		CreateAdminUserComponent,
		ViewAdminUserComponent
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	]
})
export class AdminUserModule { } 
