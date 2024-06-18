import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizacaoService } from './services/organizacao.service';
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    OrganizacaoService
  ]
})
export class OrganizacaoModule { }
export {
  OrganizacaoService,
}