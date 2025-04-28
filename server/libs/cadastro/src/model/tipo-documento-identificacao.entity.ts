import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { t } from "@ci/core";
import { schema } from "./schema";
@Entity({ schema })
export class TipoDocumentoIdentificacao extends FullAuditedEntity {
    @Column({ length: 7 })
    code?: string;
    @Column({ nullable: true }) @ApiProperty({ required: false, nullable: true, description: t`Descrição` })
    description?: string;
}