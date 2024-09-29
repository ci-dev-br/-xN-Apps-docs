import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ci-action',
  templateUrl: './action.component.html',
  styleUrl: './action.component.scss'
})
export class ActionComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Output() click = new EventEmitter<MouseEvent>();
}
