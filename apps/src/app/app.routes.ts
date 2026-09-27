import { Routes } from '@angular/router';
import { authGuard } from '@ci/core';
// TODO: rever motivo de, import { AssistenteComponent } from './assistente/assistente';
import { KeyboardComponent } from '@ci/components/keyboard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./homepage/homepage.module').then(m => m.HomepageModule)
    },
    /* { path: 'assistente', component: AssistenteComponent }, */
    {
        path: 'acessar',
        loadChildren: () => import('./acessar/acessar.module').then(m => m.AcessarModule)
    },
    {
        path: 'registrar',
        loadChildren: () => import('./registrar/registrar.module').then(m => m.RegistrarModule)
    },
    {
        path: '',
        canMatch: [authGuard],
        loadChildren: () => import('./painel/painel.module').then(m => m.PainelModule),
    },
    { path: 'keyboard', component: KeyboardComponent },
    {
        path: '**', redirectTo: '/acessar', pathMatch: 'full'
    }
];
