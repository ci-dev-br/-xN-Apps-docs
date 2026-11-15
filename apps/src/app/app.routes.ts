import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';
import { authGuard } from '@ci/core';
// TODO: rever motivo de, import { AssistenteComponent } from './assistente/assistente';
import { KeyboardComponent } from '@ci/components/keyboard';
import { ChessGameComponent } from '@ci/apps/imersao/chess';

const inviteQueryRedirectGuard = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const fromRoute = route?.queryParams?.['invite'] || route?.queryParams?.['inviteHash'] || route?.queryParams?.['convite'];
    let inviteCode = fromRoute ? String(fromRoute).trim() : '';
    if (!inviteCode && typeof window !== 'undefined' && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        inviteCode = (params.get('invite') || params.get('inviteHash') || params.get('convite') || '').trim();
    }
    if (inviteCode) {
        return router.createUrlTree(['/registrar', inviteCode], { queryParams: { invite: inviteCode } });
    }
    return true;
};

export const routes: Routes = [
    {
        path: '',
        canActivate: [inviteQueryRedirectGuard],
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
        path: 'registro',
        loadChildren: () => import('./registrar/registrar.module').then(m => m.RegistrarModule)
    },
    {
        path: '',
        canMatch: [authGuard],
        canActivate: [inviteQueryRedirectGuard],
        loadChildren: () => import('./painel/painel.module').then(m => m.PainelModule),
    },
    { path: 'keyboard', component: KeyboardComponent },
    { path: 'chess', component: ChessGameComponent },
    {
        path: '**', redirectTo: '/acessar', pathMatch: 'full'
    }
];
