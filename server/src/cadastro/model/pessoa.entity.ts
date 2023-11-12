import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Endereco } from "./endereco.entity";
import { ApiProperty } from "@nestjs/swagger";
import { InformacaoContato } from "./informacao-contato.entity";

@Entity()
export class Pessoa extends FullAuditedEntity {
    @ApiProperty()
    @Column({})
    razaoSocial?: string;
    @ApiProperty()
    @Column({})
    nomeFantasia?: string;
    @ApiProperty()
    @Column({})
    rg?: string;
    @ApiProperty()
    @Column({})
    rgOrgaoEmissor?: string;
    @ApiProperty()
    @Column({})
    emailPessoal?: string;
    @ApiProperty()
    @Column({})
    empresa?: string;
    @ApiProperty()
    @ManyToMany(() => Endereco)
    @JoinTable()
    endereco?: Endereco[];

    @ApiProperty()
    @ManyToMany(() => InformacaoContato)
    @JoinTable()
    informacoesContato: InformacaoContato[];
}