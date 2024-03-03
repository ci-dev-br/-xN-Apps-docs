import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MethodPayment {
    @PrimaryColumn('character varying', { length: 18 })
    invernalCode?: string;
}