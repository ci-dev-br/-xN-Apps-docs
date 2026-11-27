import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { AccessKeyCryptoService } from './access-key-crypto.service';
import {
  USER_STORE_KEY,
  extractChaveAcessoFromSession,
  isJwtExpired,
} from './client-session-storage';

export const authGuard: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const authService = inject(AuthService, { optional: true });
  const accessKeyCrypto = inject(AccessKeyCryptoService, { optional: true });

  const session_stored = storage.restore(USER_STORE_KEY);
  const bearer = session_stored?.authentication?.bearer;
  const refreshToken = session_stored?.authentication?.refreshToken;
  const chaveAcesso = extractChaveAcessoFromSession(session_stored);

  const hasUsableBearer = Boolean(bearer && !isJwtExpired(bearer, 0));
  const hasUsableRefresh = Boolean(refreshToken && !isJwtExpired(refreshToken, 0));

  if (!hasUsableBearer && !hasUsableRefresh) {
    storage.clean();
    if (chaveAcesso) {
      void accessKeyCrypto?.deleteKey(chaveAcesso);
    }
    return false;
  }

  if (authService) {
    try {
      const profile = await lastValueFrom(authService.profile());
      if (profile && profile.id) {
        return true;
      }
      storage.clean();
      if (chaveAcesso) {
        void accessKeyCrypto?.deleteKey(chaveAcesso);
      }
      return false;
    } catch (error) {
      console.warn('authGuard: acesso inválido ou revogado ao retomar aplicação:', error);
      storage.clean();
      if (chaveAcesso) {
        void accessKeyCrypto?.deleteKey(chaveAcesso);
      }
      return false;
    }
  }

  return true;
};
