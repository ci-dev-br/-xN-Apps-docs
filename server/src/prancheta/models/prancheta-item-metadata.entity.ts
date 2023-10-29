import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Prancheta } from "./prancheta.entity";

@Entity()
export class PranchetaItemMetadata {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    /* @ManyToOne(() => Prancheta, p => p.items)
    prnahceta?: Prancheta; */
}