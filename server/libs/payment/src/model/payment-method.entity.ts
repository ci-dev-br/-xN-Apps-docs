import { Entity, PrimaryColumn } from "typeorm";

@Entity({
    schema: 'payment'
})
export class MethodPayment {
    @PrimaryColumn('character varying', { length: 18 })
    invernalCode?: string;
}