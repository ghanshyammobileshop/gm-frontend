import { NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { UtilService } from 'app/services/util.service';
import { environment } from 'environments/environment';
import { MaterialModule } from '../../material/material.module';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MaterialModule],
})
export class AuthSignInComponent implements OnInit {
    signInForm!: UntypedFormGroup;
    feVersion: string = '';

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _utilService: UtilService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    ) { }

    ngOnInit(): void {
        this.feVersion = environment.appVersion;
        this.signInForm = this._formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, Validators.required],
        });
    }


    async signIn() {
        if (this.signInForm.invalid) {
            this.signInForm.markAllAsTouched();
            return;
        }

        try {
            this.signInForm.disable();
            const response = await this._authService.signIn(this.signInForm.value);
            this._utilService.loginUser(response);
            const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL');
            this._router.navigateByUrl(redirectURL ?? '/dashboard');
        } catch (error: any) {
            this._utilService.showErrorSnack(error);
            this.signInForm.reset();
            this.signInForm.enable();
        } finally {
            this.signInForm.enable();
        }
    }
}


