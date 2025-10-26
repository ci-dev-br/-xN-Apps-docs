import { Column, Entity } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "../dao/entities";
import { schema } from "../noms";
/**
 * Manager Deploy Options Entity
 * 
 * Stores deployment options for applications
 */
@Entity({ schema })
export class ManagerDeployOption extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, })
    @Column({ nullable: true })
    deployMode?: string;
    @ApiProperty({ nullable: true, required: false, })
    @Column({ nullable: true })
    commonName?: string;
    @ApiProperty({ nullable: true, required: false, })
    @Column({ nullable: true })
    host?: string;
    @ApiProperty({ nullable: true, required: false, })
    @Column({ nullable: true })
    user?: string;
    @ApiProperty({ nullable: true, required: false, })
    @Column({ nullable: true })
    password?: string;
}