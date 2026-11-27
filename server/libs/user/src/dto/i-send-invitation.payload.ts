import { ApiProperty } from "@nestjs/swagger";

/**
 * Payload para envio de convite de novo usuário.
 */
export class InvitationPayload {
    /**
     * E-mail do usuário a ser convidado.
     */
    @ApiProperty({ required: false, title: 'E-mail do usuário a ser convidado' })
    email?: string;
    /**
     * Nome amigável do usuário a ser convidado.
     */
    @ApiProperty({ required: false, title: 'Nome amigável do usuário a ser convidado' })
    friendlyName?: string;
    /**
     * Mensagem adicional no convite.
     */
    @ApiProperty({ required: false, title: 'Mensagem adicional no convite' })
    mensagem?: string;
    /**
     *  
     */
    @ApiProperty({ required: false, title: 'Convite' })
    convite?: string;

    @ApiProperty({ required: false, title: 'Código de Convite (Invite)' })
    invite?: string;

    @ApiProperty({ required: false, title: 'Hash do Convite (Invite Hash)' })
    inviteHash?: string;

    @ApiProperty({ required: false, nullable: true, isArray: true, type: String, title: 'Tenants de destino' })
    tenantIds?: string[];

    @ApiProperty({ required: false, nullable: true, isArray: true, type: String, title: 'Papéis iniciais do convidado' })
    roles?: string[];
}