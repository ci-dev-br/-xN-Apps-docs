import { Component, Inject, Input, Optional } from '@angular/core';
import { FORM_OPTIONS, IFormOptions } from './i-form-options';

@Component({
  selector: 'ci-dyn-form',
  templateUrl: './dyn-form.component.html',
  styleUrls: ['./dyn-form.component.scss']
})
export class DynFormComponent {
  @Input()
  source?: IFormOptions;
  constructor(
    @Optional() @Inject(FORM_OPTIONS)
    formOptions?: IFormOptions,
  ) {
    if (formOptions) this.source = formOptions;
  }
}
