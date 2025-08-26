import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../material/material.module';

@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [NgIf, FormsModule, ReactiveFormsModule, MaterialModule, RouterLink],
})
export class AuthResetPasswordComponent implements OnInit
{
    @ViewChild('resetPasswordNgForm')
    resetPasswordNgForm!: NgForm;

    resetPasswordForm!: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
                password       : ['', Validators.required],
                passwordConfirm: ['', Validators.required],
            },
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void
    {
        // Return if the form is invalid
        if ( this.resetPasswordForm.invalid )
        {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Send the request to the server
        // this._authService.resetPassword(this.resetPasswordForm.get('password').value)
        //     .pipe(
        //         finalize(() =>
        //         {
        //             // Re-enable the form
        //             this.resetPasswordForm.enable();

        //             // Reset the form
        //             this.resetPasswordNgForm.resetForm();

        //             // Show the alert
        //             this.showAlert = true;
        //         }),
        //     )
        //     .subscribe(
        //         (response) =>
        //         {
        //             // Set the alert
        //             this.alert = {
        //                 type   : 'success',
        //                 message: 'Your password has been reset.',
        //             };
        //         },
        //         (response) =>
        //         {
        //             // Set the alert
        //             this.alert = {
        //                 type   : 'error',
        //                 message: 'Something went wrong, please try again.',
        //             };
        //         },
        //     );
    }
}
