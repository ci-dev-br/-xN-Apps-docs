import { Component, Inject, Input, TemplateRef, Type, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ci-janela',
  templateUrl: './janela.component.html',
  styleUrls: ['./janela.component.scss']
})
export class JanelaComponent {
  menu = [
    // { icon: 'visibility' },
    // { icon: 'thumb_up' },
    // { icon: 'share' },
    // { icon: 'more_horiz' },
    { icon: 'done_all' },
    { icon: 'close' },
  ];
  @Input()
  component?: Type<any>;
  @ViewChild('componentTmplate')
  componentTmplate?: any;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    private data: any,
  ) { }
}
