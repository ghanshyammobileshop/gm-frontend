import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
	{ path: '', component: DashboardComponent }
]

@NgModule({
	declarations: [
		DashboardComponent
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	]
})
export class DashboardModule { }
