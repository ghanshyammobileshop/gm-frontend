import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-delete-confirm',
	standalone: true,
	imports: [
		MaterialModule,
	],
	templateUrl: './delete-confirm.component.html',
	styleUrl: './delete-confirm.component.scss'
})
export class DeleteConfirmComponent {

	constructor(
		private _dialogRef: MatDialogRef<DeleteConfirmComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }

	confirm() {
		this._dialogRef.close(true);
	}
}
