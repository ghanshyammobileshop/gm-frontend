import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from 'app/material/material.module';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { ViewCustomerComponent } from './view-customer/view-customer.component';

const routes: Routes = [
	{ path: '', component: CustomerListComponent, canActivate: [AccessGuard(AccessControls.CUSTOMER_READ_LIST)] },
	{ path: 'form', component: CreateCustomerComponent, canActivate: [AccessGuard(AccessControls.CUSTOMER_CREATE)] },
	{ path: 'form/:id', component: CreateCustomerComponent, canActivate: [AccessGuard(AccessControls.CUSTOMER_UPDATE)] },
	{ path: 'view/:id', component: ViewCustomerComponent, canActivate: [AccessGuard(AccessControls.CUSTOMER_READ_DETAILS)] },
];

@NgModule({
	declarations: [
		CustomerListComponent,
		CreateCustomerComponent,
		ViewCustomerComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	]
})
export class CustomerModule { } 
