import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './ci-application/home/home.component';

@Component({
  selector: 'ci-DevTools',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `<ci-home></ci-home>`,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `]
})
export class DevToolsComponent {}
