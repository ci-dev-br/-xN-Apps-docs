import { ApiProperty } from "@nestjs/swagger";
import { Tenant } from "src/tenant/models/tenant.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FullAuditedEntity } from "src/core/dao";

@Entity()
export class Product extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ unique: true, nullable: true })
    gtin?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    codigoBarras?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    shortDescription?: string;
    @ApiProperty({ nullable: true, required: false, description: 'URL do site' })
    @Column({ nullable: true })
    urlWebsiteOficial?: string;
    /* @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => Tenant)
    @JoinTable()
    tenant: Tenant; */
}