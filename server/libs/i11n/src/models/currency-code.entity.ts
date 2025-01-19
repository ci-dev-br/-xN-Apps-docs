import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
/**
 * Currency Code (Moeda)
 * 
 *  Entidade de cóigo de moeda 
 */
@Entity({ schema })
export class CurrencyCode {
    @Column() private code: string;
    @PrimaryGeneratedColumn('uuid')
    private id: string;
}