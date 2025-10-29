import { Component, Inject, Injector, Input, OnDestroy, OnInit, Optional, TemplateRef, Type, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DaoService } from '@ci/core';
import { ActionsService } from '../action/actions.service';
import { BehaviorSubject } from 'rxjs';

export interface IData {
  data?: any;
  [key: string]: any;
}
export interface IItemMenu {
  icon?: string;
  label?: string;
  path?: string;
  children?: IItemMenu[];
  onClick?: (...args: any) => void;
  visible?: () => boolean;
}
/**
 * Window Component
 * 
 */
@Component({
  selector: 'ci-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  standalone: false
})
export class WindowComponent implements OnInit, OnDestroy {
  @Input()
  title?: string;
  showing = false;
  acts = new BehaviorSubject<IItemMenu[] | undefined>(undefined);
  menu: IItemMenu[] = [
    {
      icon: 'done_all',
      label: 'Confirmar alterações',
      visible: () => !!this.changed,
      onClick: () => this.confirm()
    },
    {
      icon: 'open_in_new', label: 'Abrir em Janela', onClick: () => {
        window.open(location.href, 'PopupWindow' + (this.data?.data?.internalId || this.data?.data?.id || ''), "width=600,height=700,resizable=yes,top=100,left=200,");
        this.close();
      }
    },
    { icon: 'close', label: 'Fechar', onClick: () => this.close() },
  ];
  @Input()
  component?: Type<any>;
  injector = Injector.create([
    { provide: MatDialogRef<WindowComponent>, useValue: this.ref },
    { provide: MAT_DIALOG_DATA, useValue: this.data?.data || null },
    { provide: 'ACTIONS', useValue: this.acts },
  ]);
  constructor(
    @Optional() private readonly daos?: DaoService,
    @Optional() private readonly ref?: MatDialogRef<WindowComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    private data?: IData,
    @Optional() public readonly actions?: ActionsService,
  ) { }
  ngOnInit(): void {
    this.showing = true;
  }
  ngOnDestroy(): void {
    this.showing = false;
  }
  get changed() {
    if (!this.data?.data) return false;
    return this.daos?.haveChanges(!!this.data?.data?.schemaName ? this.data.data.data : this.data.data)
  }
  confirm() {
    this.daos?.confirmChanges(!!this.data?.data?.schemaName ? this.data.data.data : this.data?.data)
  }
  close() {
    this.showing = false;
    this.ref?.close(this.data?.data);
  }
}
