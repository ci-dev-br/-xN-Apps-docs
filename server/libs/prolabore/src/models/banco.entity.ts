import { ApiProperty } from '@nestjs/swagger'
import { FullAuditedEntity } from '@ci/core';
import { Column, Entity } from 'typeorm'

@Entity({ schema: 'prolabore' })
export class Banco extends FullAuditedEntity {
    @ApiProperty({ nullable: false, required: true, uniqueItems: true })
    @Column({ unique: true, nullable: false })
    code: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    descricao: string;
}