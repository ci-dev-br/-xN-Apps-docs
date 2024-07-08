import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";

@Entity()
export class MensagemRecebimento extends FullAuditedEntity {
    @Column({
        type: 'json'
    })
    retorno?: any;
}