import { Component, Inject, Injector, Input, OnDestroy, OnInit, TemplateRef, Type, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DaoService } from 'src/app/core/dao/dao.service';

export interface IItemMenu {
  icon?: string;
  label?: string;
  path?: string;
  children?: IItemMenu[];
  onClick?: () => void;
  visible?: () => boolean;
}

@Component({
  selector: 'ci-janela',
  templateUrl: './janela.component.html',
  styleUrls: ['./janela.component.scss']
})
export class JanelaComponent implements OnInit, OnDestroy {
  showing = false;
  menu: IItemMenu[] = [
    { icon: 'done_all', label: 'Confirmar alterações', visible: () => this.changed, onClick: () => this.confirm() },
    { icon: 'close', label: 'Fechar', onClick: () => this.close() },
  ];
  @Input()
  component?: Type<any>;
  injector = Injector.create([
    { provide: MAT_DIALOG_DATA, useValue: this.data.data }
  ]);
  @ViewChild('componentTmplate')
  componentTmplate?: any;
  constructor(
    private readonly daos: DaoService,
    private readonly ref: MatDialogRef<JanelaComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: any,
  ) { }
  ngOnInit(): void {
    this.showing = true;
  }
  ngOnDestroy(): void {
    this.showing = false;
  }
  get changed() {
    if (!this.data?.data) return false;
    return this.daos.haveChanges(this.data.data)
  }
  confirm() {
    this.daos.confirmChanges(this.data.data)
  }
  close() {
    this.showing = false;
    this.ref.close(this.data.data);
  }
}
