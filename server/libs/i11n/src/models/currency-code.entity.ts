import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class CurrencyCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column() code: string;
}