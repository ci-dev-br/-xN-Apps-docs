import { NgModule } from '@angular/core';
import { DocumentosComponent } from './documentos.component';
export const Manifest = {
  name: 'Meus Documentos',
};
@NgModule({
  declarations: [
    DocumentosComponent
  ],
  imports: [
  ],
  exports: [
    DocumentosComponent
  ]
})
export class DocumentosModule { }
