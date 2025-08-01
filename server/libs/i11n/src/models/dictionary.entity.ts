import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { Language } from "./language.emtity";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { Translation } from "./translation.entity";
/**
 * Dicionário de Termos do Sistema. Permite agrupar e criar dicionários personalizado para cada contexto específico sem necessídade de alteração do código-fonte. 
 */
@Entity({
    schema,
})
export class Dictionary extends FullAuditedEntity {
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    private descrition?: string;
    @ManyToOne(() => Language) @ApiProperty({ nullable: true, required: false, type: Language })
    private language?: Language;
    @ManyToMany(type => Translation, translation => translation.dictionary)
    translations?: Translation[];
}