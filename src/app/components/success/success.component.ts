import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'app/material/material.module';

@Component({
	selector: 'app-success',
	standalone: true,
	imports: [MaterialModule],
	templateUrl: './success.component.html',
	styleUrl: './success.component.scss'
})
export class SuccessComponent {

	constructor(
		private _dialogRef: MatDialogRef<SuccessComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }
}
