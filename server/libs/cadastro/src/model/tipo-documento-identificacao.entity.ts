import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { t } from "@ci/core/i18n";
import { schema } from "./schema";
@Entity({ schema })
export class TipoDocumentoIdentificacao extends FullAuditedEntity {
    @ApiProperty({ title: 'Código', required: false, nullable: true })
    @Column({ length: 7 })
    code?: string;
    @Column({ nullable: true }) @ApiProperty({ title: 'Descrição', required: false, nullable: true, description: t`Descrição` })
    description?: string;
}