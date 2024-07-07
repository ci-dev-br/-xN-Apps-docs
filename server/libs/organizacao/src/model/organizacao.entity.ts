import { ApiProperty } from "@nestjs/swagger";
import { Pessoa } from "@ci/cadastro/model/pessoa.entity";
import { FullAuditedEntity } from "@ci/core";
import { Photo } from "@ci/storage/models/photo.entity";
import { Tenant } from "@ci/tenant/models/tenant.entity";
import { Column, Entity, JoinTable, ManyToOne, } from "typeorm";

@Entity()
export class Organizacao extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, description: 'Nome da Organização' })
    @Column({ nullable: true })
    organizatioName?: string;

    @ApiProperty({ type: Photo, nullable: true, required: false, description: 'Logomarca da Organização' })
    @ManyToOne(type => Photo, { nullable: true })
    @JoinTable()
    logo?: Photo;

    @ApiProperty({ type: Tenant, nullable: true, required: false })
    @ManyToOne(type => Tenant, { nullable: true })
    @JoinTable()
    tenant?: Tenant;

    @ApiProperty({ type: Pessoa, nullable: true, required: false })
    @ManyToOne(type => Pessoa, { nullable: true })
    @JoinTable()
    cadastroPessoa?: Pessoa;
}