import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Entidade de ícone da aplicação
 */
@Entity()
export class Icon extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: true, })
    @Column({ nullable: false })
    code?: string;
    /* @ApiProperty({
        nullable: true,
    }) */
    /* @Column({ type: 'bytea', nullable: true })
    data?: Buffer; */
} 