import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from 'app/material/material.module';
import { CreateShopComponent } from './create-shop/create-shop.component';
import { ShopListComponent } from './shop-list/shop-list.component';
import { ViewShopDetailsComponent } from './view-shop-details/view-shop-details.component';

const routes: Routes = [
	{ path: '', component: ShopListComponent, canActivate: [AccessGuard(AccessControls.SHOP_READ_LIST)] },
	{ path: 'form', component: CreateShopComponent, canActivate: [AccessGuard(AccessControls.SHOP_CREATE)] },
	{ path: 'form/:id', component: CreateShopComponent, canActivate: [AccessGuard(AccessControls.SHOP_UPDATE)] },
	{ path: 'view/:id', component: ViewShopDetailsComponent, canActivate: [AccessGuard(AccessControls.SHOP_READ_DETAILS)] },
];

@NgModule({
	declarations: [
		ShopListComponent,
		CreateShopComponent,
		ViewShopDetailsComponent
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	]
})
export class ShopModule { } 
