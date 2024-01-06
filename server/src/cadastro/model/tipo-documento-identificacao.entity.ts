import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";
import { t } from "src/core/i18n/t";

@Entity({ schema: 'cadastro' })
export class TipoDocumentoIdentificacao extends FullAuditedEntity {
    @Column({ length: 7 })
    code?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, description: t`Descrição` })
    description?: string;
}