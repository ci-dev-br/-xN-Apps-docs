import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { t } from "@ci/core";

@Entity({ schema: 'cadastro' })
export class TipoDocumentoIdentificacao extends FullAuditedEntity {
    @Column({ length: 7 })
    code?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, description: t`Descrição` })
    description?: string;
}