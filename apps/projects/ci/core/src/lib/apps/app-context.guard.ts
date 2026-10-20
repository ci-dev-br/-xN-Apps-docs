import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApplicationCatalogService } from './application-catalog.service';
import { Message } from '../services/message';

/**
 * Guarda de rota que verifica se a aplicação possui permissão contextual
 * para ser carregada no tenant / usuário atual.
 */
export const AppContextGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const catalogService = inject(ApplicationCatalogService);
    const router = inject(Router);
    const messageService = inject(Message, { optional: true });

    const appKey = ApplicationCatalogService.detectFromUrl(state.url);
    if (!appKey) {
        return true;
    }

    let tenantId: string | undefined;
    if (typeof localStorage !== 'undefined') {
        tenantId = localStorage.getItem('CI_ACTIVE_TENANT_ID') || undefined;
    }

    return catalogService.canLoadApp(appKey, tenantId).pipe(
        map(result => {
            if (result && result.canLoad === false) {
                const message = result.reason || 'Aplicação não disponível neste contexto.';
                console.warn(`[AppContextGuard] Bloqueado carregamento de ${appKey}: ${message}`);
                messageService?.show(message, 'Fechar', 5000);
                router.navigate(['/painel/meus-apps']);
                return false;
            }

            // Se a rota possui mini documentação declarada em seus metadados,
            // verifica e exibe automaticamente no primeiro acesso
            const docs = (route.data && route.data['docs']) || (route.routeConfig?.data && (route.routeConfig.data as any)['docs']);
            if (docs) {
                setTimeout(() => {
                    catalogService.checkAndShowFirstAccessDoc(appKey, docs);
                }, 350);
            }

            return true;
        }),
        catchError(err => {
            // Em caso de falha de conectividade, permite carregamento offline/degradado
            return of(true);
        })
    );
};
