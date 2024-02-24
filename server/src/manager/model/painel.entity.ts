import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";

@Entity()
export class Painel extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    endpoint?: string;
}