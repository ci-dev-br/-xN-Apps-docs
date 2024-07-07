import { Entity, JoinTable, OneToOne } from "typeorm";
import { Cliente } from "./cliente.entity";
import { FullAuditedEntity } from "@ci/core";

@Entity({ schema: 'prolabore' })
export class TransferenciaPix extends FullAuditedEntity {
    @OneToOne(() => Cliente)
    @JoinTable()
    customer: Cliente;
}