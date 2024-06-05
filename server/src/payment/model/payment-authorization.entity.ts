import { FullAuditedEntity } from "src/core/dao";
import { Entity } from "typeorm";

@Entity({
    schema: 'payment'
})
export class PaymentAuthorization extends FullAuditedEntity {

}