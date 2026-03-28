import { Component, EventEmitter, HostListener, inject, Inject, Injector, Input, OnDestroy, OnInit, Optional, Output, PLATFORM_ID, TemplateRef, Type, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DaoService } from '@ci/core';
import { ActionsService } from '../action/actions.service';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface IData {
  data?: any;
  [key: string]: any;
}
export interface IItemMenu {
  component?: Type<any>;
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
  @Output('events')
  eventsOutput = new EventEmitter<Object>();
  /* @Output('changed')
  changedOutput = new EventEmitter<any>(); */
  /* @Output('confirm')
  confirmOutput = new EventEmitter<any>(); */
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
      visible: () => {
        return (!!(this.data as any)?.data?.data && 'internalId' in (this.data as any).data.data);
      },
      icon: 'open_in_new', label: 'Abrir em Janela', onClick: () => {
        const object_identification = (this.data as any)?.data?.data?.internalId || (this.data as any)?.data?.data?.id;
        window.open(location.href + '/Editar/' + object_identification, 'PopupWindow' + (object_identification), "width=600,height=700,resizable=yes,top=100,left=200,");
        this.close();
      }
    },
    { icon: 'close', label: 'Fechar', onClick: () => this.close() },
  ];
  @Input()
  component?: Type<any>;
  injector = Injector.create([
    { provide: MatDialogRef<WindowComponent>, useValue: this.ref },
    { provide: MAT_DIALOG_DATA, useValue: (this.data as any)?.data || null },
    { provide: 'ACTIONS', useValue: this.acts }
  ]);
  daos?: DaoService;
  constructor(
    @Optional() private readonly ref?: MatDialogRef<WindowComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) protected data?: IData,
    // @Optional() public readonly actions?: ActionsService,
  ) { }
  ngOnInit(): void {
    this.showing = true;
  }
  ngOnDestroy(): void {
    this.showing = false;
  }
  get changed() {
    return false;
    /* if (!(this.data as any)?.data) return false;
    return this.daos?.haveChanges(!!(this.data as any)?.data?.schemaName ? (this.data as any)?.data.data : (this.data as any)?.data) */
  }
  confirm() {
    /*   this.confirmOutput.emit(!!(this.data as any)?.data?.schemaName ? (this.data as any).data.data : (this.data as any)?.data);
      this.daos?.confirmChanges(!!(this.data as any)?.data?.schemaName ? (this.data as any).data.data : (this.data as any)?.data) */
  }
  close() {
    this.showing = false;
    /* this.ref?.close((this.data as any)?.data); */
  }
  @HostListener('keydown', ['$event'])
  protected async keydownHandler(event: KeyboardEvent) {
    if ((!!event.shiftKey && (event.code === 'Enter' || event.code === 'NumpadEnter')) ||
      (!!event.ctrlKey && (event.code === 'KeyS'))) {
      if (!!event?.preventDefault) event.preventDefault();
      await this.confirm();
      if (!!event.shiftKey) this.ref?.close()
    }
  }
}
