import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

@Entity({
    schema: 'payment'
})
export class PaymentAuthorization extends FullAuditedEntity {

}