import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";

/**
 * Role personalizado pertencente a uma Organização, sempre com prefixo "ORG".
 */
@Entity({ schema })
export class OrganizacaoRole extends FullAuditedEntity {
    @ApiProperty({ description: 'ID interno da Organização' })
    @Column()
    organizacaoId: string;

    @ApiProperty({ description: 'Código do role com prefixo ORG (ex: ORG_FINANCEIRO)' })
    @Column()
    code: string;

    @ApiProperty({ description: 'Nome personalizado informado pelo criador' })
    @Column()
    customName: string;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    createdByUserId?: string;
}
