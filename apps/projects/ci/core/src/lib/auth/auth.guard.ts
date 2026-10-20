import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService, { optional: true });

  const session_stored = storage.restore('apps.ci.dev.br.store.User');
  const hasAuth = !!session_stored?.authentication?.bearer || !!session_stored?.authentication?.refreshToken;
  if (!hasAuth) {
    storage.clean();
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem('CIUSR'); } catch {}
    }
    return false;
  }

  if (authService) {
    try {
      const profile = await lastValueFrom(authService.profile());
      if (profile && profile.id) {
        return true;
      }
    } catch (error) {
      console.warn('authGuard: acesso inválido ou revogado ao retomar aplicação:', error);
      storage.clean();
      if (typeof localStorage !== 'undefined') {
        try { localStorage.removeItem('CIUSR'); } catch {}
      }
      return false;
    }
  }

  return true;
};

