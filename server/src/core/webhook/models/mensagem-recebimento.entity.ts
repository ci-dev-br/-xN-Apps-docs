import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";

@Entity()
export class MensagemRecebimento extends FullAuditedEntity {
    @Column({
        type: 'json'
    })
    retorno?: any;
}