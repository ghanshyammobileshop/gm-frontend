import { MediaMatcher } from '@angular/cdk/layout';
import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, effect, HostBinding, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { NotificationComponent } from './notification/notification.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MaterialModule, RouterOutlet, NgIf, MatSidenavModule, NgFor, RouterModule, SidebarComponent, NotificationComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  screenWidth: number;

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  darkMode = signal<boolean>(false);

  docElement!: HTMLElement;
  isFullScreen: boolean = false;

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, @Inject(PLATFORM_ID) private platformId: Object) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    if (isPlatformBrowser(this.platformId)) {
      this.darkMode = signal<boolean>(
        JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
      );

      effect(() => {
        window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
      });
    }

    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.docElement = document.documentElement;
  }

  toggleFullScreen() {
    if (!this.isFullScreen) {
      this.docElement.requestFullscreen();
    }
    else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }
}
