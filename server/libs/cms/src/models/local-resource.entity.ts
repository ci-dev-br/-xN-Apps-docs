import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
/**
 * Local Resource
 */
@Entity({ schema })
export class LocalResource extends FullAuditedEntity {
    @Column({})
    fullPath?: string;
    @Column({
        comment: 'Identifica se deve garantir que determinada Engine de disco esteja ativa antes de tentar obter o arquivo no sistema de arquivos (comum para arquivos em nuvem).',
        nullable: true
    })
    engine?: string;
    @Column({})
    integrity?: string;
}