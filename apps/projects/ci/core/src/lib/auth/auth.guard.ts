import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  let session_stored = inject(StorageService).restore('apps.ci.dev.br.store.User');
  if (!!session_stored) {
    return true;
  } else {
    inject(Router).navigate(['/acessar']);
    return false;
  }
};
