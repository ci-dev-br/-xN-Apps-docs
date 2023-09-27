import { Component, Inject, Injector, Input, TemplateRef, Type, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface IItemMenu {
  icon?: string;
  label?: string;
  path?: string;
  children?: IItemMenu[];
  onClick?: () => void;
}

@Component({
  selector: 'ci-janela',
  templateUrl: './janela.component.html',
  styleUrls: ['./janela.component.scss']
})
export class JanelaComponent {
  menu: IItemMenu[] = [
    // { icon: 'visibility' },
    // { icon: 'thumb_up' },
    // { icon: 'share' },
    // { icon: 'more_horiz' },
    { icon: 'done_all' },
    { icon: 'close', onClick: () => this.close() },
  ];
  @Input()
  component?: Type<any>;
  @ViewChild('componentTmplate')
  componentTmplate?: any;
  constructor(
    private readonly ref: MatDialogRef<JanelaComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: any,
  ) { }
  close() {
    this.ref.close();
  }
}
