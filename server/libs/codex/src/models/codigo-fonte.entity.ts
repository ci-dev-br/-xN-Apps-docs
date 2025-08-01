
import { FullAuditedEntity } from "@ci/core";
import { Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { File } from "./file.entity";
@Entity({
    schema
})
export class CodigoFonte extends FullAuditedEntity {
    @ApiProperty({ type: File, isArray: true })
    @ManyToMany(t => File, { cascade: true })
    @JoinTable()
    files: File[];
}