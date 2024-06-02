import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./homepage/homepage.module').then(m => m.HomepageModule) }
];
