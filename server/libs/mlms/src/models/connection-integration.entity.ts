import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
/**
 * Conector de Integração 
 * armazena as chaves de acesso de conectores, 
 * vinculadas a determinado usuário a partir de
 * uma chave de sessão entre tenants. 
 * 
 * Podem ser utilizadas para autenticar apis de fluxos 
 * exclusivos do usuário vinculado.
 * 
 */
@Entity({
    schema
})
export class ConnectionIntegration extends FullAuditedEntity {
    @Column({ nullable: true })
    name?: string;
    @Column({ nullable: true })
    tokenAuthority?: string;
    @Column({ type: 'jsonb', nullable: true })
    accessAuthority?: any;
}