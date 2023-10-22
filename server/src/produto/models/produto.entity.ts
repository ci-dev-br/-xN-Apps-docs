import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Produto {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true, nullable: true })
    gtin?: string;
    @Column({ nullable: true })
    codigoBarras?: string;
    @Column({ nullable: true })
    description?: string;
    @Column({ nullable: true })
    shortDescription?: string;
    @Column({ nullable: true })
    urlWebsite?: string;
}