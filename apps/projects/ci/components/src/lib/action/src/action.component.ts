import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'ci-action',
    templateUrl: './action.component.html',
    styleUrl: './action.component.scss',
    standalone: false
})
export class ActionComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() type?: 'material' | 'svg' = 'material';
  @Output() click = new EventEmitter<MouseEvent>();
}
