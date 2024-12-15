import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";

/**
 * Marketing - CRM - Link de Retorno - registra o link de rertorno e um link recebido dentro do sistema. O link de retorno permite registrar um retorno para disparo em determinadas automações.
 */
@Entity({ schema: 'marketing' })
export class BackLink extends FullAuditedEntity {
    @Column({ nullable: true })
    enderecoRetorno?: string;
}