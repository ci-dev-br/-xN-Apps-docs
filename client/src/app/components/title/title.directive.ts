import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ciTitle]',
  standalone: true
})
export class TitleDirective {
  @Input('ciTitle') title?: TemplateRef<any>;
  constructor() { }
}
