import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgIf, NgFor, NgClass, NgTemplateOutlet, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MaterialModule,NgIf,NgFor, NgClass, NgTemplateOutlet, RouterLink, DatePipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  @ViewChild('notificationsOrigin')
  private _notificationsOrigin!: MatButton;
  @ViewChild('notificationsPanel')
  private _notificationsPanel!: TemplateRef<any>;

  notifications!: Notification[];
  unreadCount: number = 0;
  private _overlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _overlay: Overlay,
      private _viewContainerRef: ViewContainerRef,
  )
  {
  }

  ngOnInit(): void { }


  openPanel(): void
  {
      // Return if the notifications panel or its origin is not defined
      if ( !this._notificationsPanel || !this._notificationsOrigin )
      {
          return;
      }

      // Create the overlay if it doesn't exist
      if ( !this._overlayRef )
      {
          this._createOverlay();
      }

      // Attach the portal to the overlay
      this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
  }

  /**
   * Close the notifications panel
   */
  closePanel(): void
  {
      this._overlayRef.detach();
  }

  private _createOverlay(): void
  {
      // Create the overlay
      this._overlayRef = this._overlay.create({
          hasBackdrop     : true,
          backdropClass   : 'fuse-backdrop-on-mobile',
          scrollStrategy  : this._overlay.scrollStrategies.block(),
          positionStrategy: this._overlay.position()
              .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
              .withLockedPosition(true)
              .withPush(true)
              .withPositions([
                  {
                      originX : 'start',
                      originY : 'bottom',
                      overlayX: 'start',
                      overlayY: 'top',
                  },
                  {
                      originX : 'start',
                      originY : 'top',
                      overlayX: 'start',
                      overlayY: 'bottom',
                  },
                  {
                      originX : 'end',
                      originY : 'bottom',
                      overlayX: 'end',
                      overlayY: 'top',
                  },
                  {
                      originX : 'end',
                      originY : 'top',
                      overlayX: 'end',
                      overlayY: 'bottom',
                  },
              ]),
      });

      // Detach the overlay from the portal on backdrop click
      this._overlayRef.backdropClick().subscribe(() =>
      {
          this._overlayRef.detach();
      });
  }
}
