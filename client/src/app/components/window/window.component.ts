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
/**
 * Window Component
 * 
 */
@Component({
  selector: 'ci-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnDestroy {
  @Input()
  title?: string;
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
  constructor(
    private readonly daos: DaoService,
    private readonly ref: MatDialogRef<WindowComponent>,
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
