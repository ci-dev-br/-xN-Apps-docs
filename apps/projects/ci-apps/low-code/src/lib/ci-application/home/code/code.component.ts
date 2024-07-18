import { Component, ElementRef, ViewChild } from '@angular/core';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-code',
  standalone: true,
  imports: [
    CoreModule,
  ],
  templateUrl: './code.component.html',
  styleUrl: './code.component.scss'
})
export class CodeComponent {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;
}
