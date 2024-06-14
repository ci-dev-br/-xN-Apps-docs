import { Routes } from '@angular/router';
import { authGuard } from '@ci/core';

export const routes: Routes = [
    { path: 'acessar', loadChildren: () => import('./acessar/acessar.module').then(m => m.AcessarModule) },
    { path: 'registrar', loadChildren: () => import('./registrar/registrar.module').then(m => m.RegistrarModule) },
    { path: '', canMatch: [authGuard], loadChildren: () => import('./painel/painel.module').then(m => m.PainelModule), },
    { path: '', loadChildren: () => import('./homepage/homepage.module').then(m => m.HomepageModule) },
    { path: '**', redirectTo: '/acessar', pathMatch: 'full' },
];
