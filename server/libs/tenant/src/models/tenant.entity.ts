import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
/**
 * Tipo Organização | Grupo
 * 
 */
@Entity()
export class Tenant {
    @ApiProperty() @PrimaryGeneratedColumn('uuid') id?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true }) name?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true }) descriptions?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true }) createdBy?: string;
}