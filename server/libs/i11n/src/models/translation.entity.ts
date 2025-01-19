import { Column, Entity, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { Dictionary } from "./dictionary.entity";
import { ApiProperty } from "@nestjs/swagger";
@Entity({
    schema
})
export class Translation extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: false }) private code?: string;
    @Column({ nullable: true }) private source: string;
    @Column({ nullable: false }) private translation?: string;
    @ManyToMany(type => Dictionary, dictionary => dictionary.translations)
    dictionary?: Dictionary;
}