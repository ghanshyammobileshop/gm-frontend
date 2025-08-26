import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from '../../material/material.module';
import { LogDetailsComponent } from './log-details/log-details.component';
import { LogListComponent } from './log-list/log-list.component';

const routes: Routes = [
	{ path: '', component: LogListComponent, canActivate: [AccessGuard(AccessControls.LOG_READ_ALL)] },
	{ path: 'details/:id', component: LogDetailsComponent, canActivate: [AccessGuard(AccessControls.LOG_READ_ALL)] },
]

@NgModule({
	declarations: [
		LogListComponent,
		LogDetailsComponent,
	],

	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes),
	]
})

export class LogReportModule { }
