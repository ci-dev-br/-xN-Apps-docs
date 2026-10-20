import { Policy, User } from '@ci/portal-api';

/**
 * Representa uma conta/sessão conectada simultaneamente no cliente.
 */
export interface ConnectedAccount {
    /** Identificador único do usuário */
    id: string;
    /** Dados do perfil do usuário */
    user: User;
    /** Credenciais e chaves da sessão autenticada */
    authentication: {
        bearer?: string;
        refreshToken?: string;
        chaveAcesso?: string;
        mode?: string;
        [key: string]: any;
    };
    /** Data/hora em que a conta foi conectada */
    connectedAt: string;
    /** Indica se esta é a conta atualmente ativa para realizar ações */
    isActive: boolean;
}
