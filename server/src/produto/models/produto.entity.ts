import { Tenant } from "src/tenant/models/tenant.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
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
    urlWebsiteOficial?: string;
    @ManyToOne(() => Tenant)
    @JoinTable()
    tenant: Tenant;
}