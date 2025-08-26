import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-empty-layout',
  standalone: true,
  imports: [MaterialModule,RouterOutlet,NgIf],
  templateUrl: './empty-layout.component.html',
  styleUrl: './empty-layout.component.scss'
})
export class EmptyLayoutComponent {

}
