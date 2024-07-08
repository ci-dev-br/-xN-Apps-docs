import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { PaymentAuthorization } from "./payment-authorization.entity";

@Entity({
    schema: 'payment'
})
export class Payment extends FullAuditedEntity {
    @Column({ nullable: false })
    evaluation?: number;
    description?: number;
    @OneToOne(type => PaymentAuthorization)
    @JoinColumn()
    authorization?: PaymentAuthorization;
}   