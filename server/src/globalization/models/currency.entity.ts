import { Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Currency {
    @PrimaryGeneratedColumn('uuid')
    id: string;
}