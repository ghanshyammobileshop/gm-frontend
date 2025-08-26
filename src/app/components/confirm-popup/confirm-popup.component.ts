import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-popup',
  standalone: true,
  imports: [
    MaterialModule,
  ],
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.scss'
})
export class ConfirmPopupComponent {

  constructor(
    private _dialogRef: MatDialogRef<ConfirmPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  confirm() {
    this._dialogRef.close(true);
  }

}
