import { FullAuditedEntity } from "@ci/manager/dao";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity({schema:'marketing'})
export class KeyWord extends FullAuditedEntity {
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) termo?: string;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) voulePesquisa?: number;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) dificuldadeClassificacao?: number;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) intencaoPesquisa?: number;
}