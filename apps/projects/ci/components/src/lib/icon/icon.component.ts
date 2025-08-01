import { Component, Input } from '@angular/core';

@Component({
  selector: 'ci-icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() mode?: 'material' | 'img' | 'svg' = 'material';
  @Input() icon?: string;
}
