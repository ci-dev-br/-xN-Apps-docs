import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity()
export class BillingType {
    @PrimaryColumn()
    code?: string;
    @Column()
    descricao?: string;
}