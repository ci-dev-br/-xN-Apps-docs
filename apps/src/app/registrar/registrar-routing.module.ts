import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrarComponent } from './registrar.component';

const routes: Routes = [
  { path: '', component: RegistrarComponent, },
  { path: ':invite', component: RegistrarComponent, },
];
/**
 * # Rotas para o módulo de registro.
 * 
 * ## Descrição:
 * Este módulo define as rotas para o processo de registro de novos usuários na aplicação.
 * A rota principal (`''`) carrega o `RegistrarComponent`, que gerencia a interface e a lógica de registro.
 *
 
*/
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrarRoutingModule { }
