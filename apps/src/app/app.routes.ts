import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'acessar', loadChildren: () => import('./acessar/acessar.module').then(m => m.AcessarModule) },
    { path: 'registrar', loadChildren: () => import('./registrar/registrar.module').then(m => m.RegistrarModule) },
    { path: '', loadChildren: () => import('./homepage/homepage.module').then(m => m.HomepageModule) },
];
