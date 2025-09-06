import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from 'app/material/material.module';
import { ViewSettingsComponent } from './view-settings/view-settings.component';

const routes: Routes = [
	{ path: '', component: ViewSettingsComponent, canActivate: [AccessGuard(AccessControls.APP_SETTINGS)] },
];

@NgModule({
	declarations: [
		ViewSettingsComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	]
})
export class SettingsModule { } 
