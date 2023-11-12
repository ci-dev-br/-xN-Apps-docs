import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Endereco } from "./endereco.entity";
import { ApiProperty } from "@nestjs/swagger";
import { InformacaoContato } from "./informacao-contato.entity";

@Entity({ schema: 'cadastro' })
export class Pessoa extends FullAuditedEntity {
    @ApiProperty()
    @Column({})
    razaoSocial?: string;
    @ApiProperty()
    @Column({})
    nomeFantasia?: string;
    @ApiProperty()
    @Column({
        comment: 'Registro Geral',
        nullable: true
    })
    rg?: string;
    @ApiProperty()
    @Column({
        comment: 'Registro Geral Órgão Emissor',
        nullable: true
    })
    rgOrgaoEmissor?: string;
    @ApiProperty()
    @Column({ nullable: true })
    emailPessoal?: string;
    @ApiProperty()
    @Column({ nullable: true })
    empresa?: string;
    @ApiProperty()
    @ManyToMany(() => Endereco)
    @JoinTable()
    endereco?: Endereco[];

    @ApiProperty()
    @ManyToMany(() => InformacaoContato)
    @JoinTable()
    informacoesContato: InformacaoContato[];

    @Column({ nullable: true })
    site: string;
}