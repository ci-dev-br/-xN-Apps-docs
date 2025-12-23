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
}