import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Application, FormsService } from '@ci/portal-api';
import { ApplicationService } from '@ci/portal-api';
import { IChangeable, DaoService, DaoBuilder } from '@ci/core';
import { ActionsService } from '@ci/components';
import { DialogRef } from '@angular/cdk/dialog';
import { IItemMenu, WindowComponent } from '@ci/components/window';

@Component({
  selector: 'ci-editar-aplicativo',
  templateUrl: './editar-aplicativo.component.html',
  styleUrls: ['./editar-aplicativo.component.scss'],
  providers: [
    // ActionsService,
  ],
  standalone: false
})
export class EditarAplicativoComponent implements OnInit, OnDestroy {
  form?: FormGroup<any>;
  constructor(
    private readonly ref: MatDialogRef<WindowComponent>,
    private readonly applicationService: ApplicationService,
    private readonly dao: DaoService,
    private readonly daoBuilder: DaoBuilder,
    private readonly fb: FormBuilder,
    private readonly formsService: FormsService,
    @Inject(MAT_DIALOG_DATA)
    public readonly data?: Application,
    @Optional() @Inject('ACTIONS') actions?: BehaviorSubject<IItemMenu[]>,
  ) {
    if (actions) actions.next([...(actions.value || []), {

      label: 'Remover Aplicação',
      icon: 'delete',
      onClick: async () => {
        if (data) await lastValueFrom(this.applicationService.delete({ body: data }));
        this.ref?.close(null);
      }
    }])
  }
  async ngOnDestroy() {
  }
  async ngOnInit() {
    const dao = this.dao;
    const _data = this.data;
    this.form = await this.daoBuilder.getForm('Application');
    const form = this.form;
    this.dao.prepareToEdit(this.data);
    if (this.form) this.dao.bindDataForm(this.data, this.form);
    this.dao.confirmation(this.data)?.subscribe(async data => {
      try {
        if (this.data && data) {
          Object.assign(this.data,
            await lastValueFrom(this.applicationService.sync({ body: { ...data, id: this.data?.id } }))
          );
          delete (_data as IChangeable).__pre;
          dao.prepareToEdit(_data);
          if (form) dao.bindDataForm(_data, form);
        }
      } catch (error) {

      }
    });
  }
  async findIcon() {
    const pesquisa = await prompt('Pesquisar ícone por...');
    if (pesquisa)
      setTimeout(async () => {
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=700,height=600`;
        const janela = window.open(`https://fonts.google.com/icons?icon.query=${pesquisa}`, 'test', params);
        if (janela) {
          console.log(janela);
          janela.onclose = (event) => {
            console.log(janela, event);
          }
          janela.addEventListener('click', (e) => {
            console.log(e);
          })
        }
      }, 0);
  }
  get changes() {
    return this.dao.getChanges(this.data as IChangeable);
  }
  addRole(e: any) {
    if (e.value && e.value.length > 0) {
      if (this.data && !this.data?.roles) this.data.roles = [];
      this.data?.roles?.push(e.value);
      (e.input as HTMLInputElement).value = '';
    }
  }
  removeRole(role: string) {
    if (role && this.data?.roles && this.data.roles.indexOf(role) > -1) {
      this.data?.roles?.splice(this.data?.roles.indexOf(role), 1);
    }
  }
}
