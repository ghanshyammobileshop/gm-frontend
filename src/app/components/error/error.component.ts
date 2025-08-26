import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {

}

export default [
  {
      path     : '',
      component: ErrorComponent,
  },
] as Routes;