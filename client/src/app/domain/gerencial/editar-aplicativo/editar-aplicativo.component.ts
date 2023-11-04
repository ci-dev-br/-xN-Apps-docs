import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { Application } from '@portal/api';
import { ApplicationService } from '@portal/api';
import { IChangeable, DaoService } from 'src/app/core/dao/dao.service';

@Component({
  selector: 'ci-editar-aplicativo',
  templateUrl: './editar-aplicativo.component.html',
  styleUrls: ['./editar-aplicativo.component.scss']
})
export class EditarAplicativoComponent implements OnInit, OnDestroy {
  form = this.fb.group({
    id: ['', []],
    name: ['', []],
    description: ['', []],
    icon: ['', []],
    url: ['', []],
  });
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly dao: DaoService,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public readonly data?: Application,

  ) { }
  ngOnDestroy(): void {
  }
  ngOnInit(): void {
    const dao = this.dao;
    const _data = this.data;
    const form = this.form;
    this.dao.prepareToEdit(this.data);
    this.dao.bindDataForm(this.data, this.form);
    this.dao.confirmation(this.data)?.subscribe(async data => {
      try {
        if (this.data && data) {
          Object.assign(this.data,
            await lastValueFrom(this.applicationService.sync({ body: { ...data, id: this.data?.id } }))
          );
          delete (_data as IChangeable).__pre;
          dao.prepareToEdit(_data);
          dao.bindDataForm(_data, form);
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
