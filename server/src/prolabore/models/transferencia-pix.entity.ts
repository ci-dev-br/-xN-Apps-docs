import { Entity, JoinTable, OneToOne } from "typeorm";
import { Cliente } from "./cliente.entity";
import { FullAuditedEntity } from "src/core/dao";

@Entity()
export class TransferenciaPix extends FullAuditedEntity {
    @OneToOne(() => Cliente)
    @JoinTable()
    customer: Cliente;
}