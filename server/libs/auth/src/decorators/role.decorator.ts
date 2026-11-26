import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'ROLE_KEY';
export const ALL_ROLES_KEY = 'ALL_ROLES_KEY';

export const Role = (...roles: string[]) =>
    SetMetadata(ROLE_KEY, roles.length <= 1 ? roles[0] : roles);

/**
 * Exige que o usuário autenticado possua TODOS os papéis informados (ex: DEVELOPER + SYSADMIN).
 */
export const RequireAllRoles = (...roles: string[]) =>
    SetMetadata(ALL_ROLES_KEY, roles);

