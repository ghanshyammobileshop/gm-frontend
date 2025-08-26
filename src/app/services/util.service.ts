import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderComponent } from 'app/components/loader/loader.component';
import { Const } from 'app/const';
import { LoginUser } from 'app/models/login-user';
import { User } from 'app/models/user';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root',
})
export class UtilService {

    public loginChangeObx: BehaviorSubject<User | null>;
    private progressRef: OverlayRef | undefined;

    constructor(
        private storageService: StorageService,
        private overlay: Overlay,
        private _matSnackbar: MatSnackBar,
    ) {
        this.loginChangeObx = new BehaviorSubject<User | null>(this.storageService.getCurrentUser());
    }

    updateUserProfile(user: User) {
        this.storageService.setCurrentUser(user);
        this.loginChangeObx.next(user);
    }

    loginUser(rUser: LoginUser) {
        this.storageService.setSessionToken(rUser.token);
        this.storageService.setCurrentUser(rUser.user);
        this.loginChangeObx.next(rUser.user);
    }

    encode(data: any) {
        return window.btoa(JSON.stringify(data));
    }

    decode(data: any) {
        if (data) {
            return JSON.parse(window.atob(data));
        }
        return {};
    }

    formatString(str: string, ...val: string[]) {
        for (let index = 0; index < val.length; index++) {
            str = str.replace(`{${index}}`, val[index]);
        }
        return str;
    }

    showSuccessSnack(message: string, duration: number = 5000): void {
        if (message) {
            this._matSnackbar.open(message, undefined, {
                duration: duration,
                panelClass: ['green-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    showErrorSnack(error: any, duration: number = 5000): void {
        let message;

        console.error(error);

        if (typeof error !== 'string') {
            message = error?.error?.message;
        }

        if (typeof error == 'string') {
            message = error;
        }

        if (!message) {
            message = 'We encountered an issue. Please try again later.';
        }

        this._matSnackbar.open(message, undefined, {
            duration: duration,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });

    }

    public saveAsFile(data: HttpResponse<Blob>, name: string): void {
        const blob = data.body;
        const url = window.URL.createObjectURL(blob ?? new Blob());
        const anchor = document.createElement('a');
        anchor.download = name;
        anchor.href = url;
        anchor.click();
    }

    removeZ(date: string): string {
        return moment(date).format(Const.DateFormat.isoWithoutZ);
    };

    createOverlayRef() {
        // Globally centered position strategy
        const positionStrategy = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();

        // Create the overlay with customizable options
        this.progressRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            backdropClass: 'overlay-backdrop',
            panelClass: 'overlay-panel',
            disposeOnNavigation: true,
        });
    }

    showLoader() {
        if (this.progressRef != undefined) {
            this.hideLoader();
        }
        this.createOverlayRef();
        var portal = new ComponentPortal(LoaderComponent);
        this.progressRef?.attach(portal);
    }

    hideLoader() {
        this.progressRef?.dispose();
    }
}
