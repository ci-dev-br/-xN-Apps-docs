import { Component, ElementRef, HostListener, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControlDirective, FormGroupDirective, FormGroup } from '@angular/forms';

@Component({
  selector: 'ci-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent implements OnInit {
  @Input() mode?: 'input' | 'content-editable' = 'input';
  @Input() stage?: 'edit' | 'view' = 'view';
  @Input() fieldName?: string;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input()
  el?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | undefined;
  async confirm(event: MouseEvent | Event) {
    event.stopPropagation();
    this.stage = 'view';
  }
  @HostListener('click')
  async clickHandler() {
    if (this.stage === 'view') this.stage = 'edit';
  }
  @Input() form?: FormGroup<any>;
  private _input?: ElementRef<HTMLInputElement>;
  @ViewChild('input', { static: false })
  set input(value) {
    if (this._input === value) return;
    this._input = value;
    setTimeout(() => {
      if (value?.nativeElement)
        value.nativeElement.focus();
    });
  }
  get input() { return this._input; }
  value?: any;
  constructor(
    @Optional() private readonly formGroupDirective?: FormGroupDirective,
    @Optional() private readonly formControlDirective?: FormControlDirective,
  ) { }
  ngOnInit() {
    if (this.formGroupDirective?.form && this.fieldName) {
      this.form = this.formGroupDirective.form;
      let control = this.formGroupDirective.form.get(this.fieldName);
      this.value = control?.value;
      control?.valueChanges.subscribe(newValue => {
        this.value = newValue;
      });
    }
  }
}
