import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { ChaveAcesso } from "../audt";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../shema";
@Entity({
    schema
})
export class Localization extends FullAuditedEntity {
    @ApiProperty({ type: ChaveAcesso })
    @ManyToOne(t => ChaveAcesso, c => null, { persistence: true })
    @JoinColumn()
    chaveAcesso?: ChaveAcesso;
    @Column({ nullable: true }) latitude?: number;
    @Column({ nullable: true }) longitude?: number;
    @CreateDateColumn() time?: Date;
} 