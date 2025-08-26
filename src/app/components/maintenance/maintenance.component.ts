import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent {

}

export default [
  {
      path     : '',
      component: MaintenanceComponent,
  },
] as Routes;