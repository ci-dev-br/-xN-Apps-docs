import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Endereco } from "./endereco.entity";
import { ApiProperty } from "@nestjs/swagger";
import { InformacaoContato } from "./informacao-contato.entity";
import { DocumentoIdentificacao } from "./documento-identificacao.entity";
import { t } from "src/core/i18n/t";

/**
 * Cadastro de Pessoa, Entidade Física ou Jurídica, representada, ou não por instituição de outrem
 * 
 */
@Entity({ schema: 'cadastro' })
export class Pessoa extends FullAuditedEntity {
    /**
     * Nome
     */
    @ApiProperty({ required: false, nullable: true, description: 'Nome' })
    @Column({ nullable: true })
    nome?: string;
    /**
     * Sobrenome
     */
    @ApiProperty({ required: false, nullable: true, description: 'Sobrenome' })
    @Column({ nullable: true })
    sobrenome?: string;
    /**
     * Nome de Batismo ou Preferido em Origem
     */
    @ApiProperty()
    @Column({})
    razaoSocial?: string;
    /**
     * Nome de Apresentação em Documentos Vinculados
     */
    @ApiProperty()
    @Column({})
    nomeFantasia?: string;
    /**
     * Registro Geral em Caso de Pessoa Física registrada em território Brasileiro de acordo com a Constituição Federal. Obrigatório em casos de recolhimentos automatizados de documentos juntos ao estado. Sendo opcional para casos de alimentação manual de base. Esse documento se torna obrigatório em caso de automações junto ao estado em nome do próprio requerente. Sendo obrigatório a autorização direta do uso de seus dados. Com cancelamento ativo por parte do sistema em contato direto com o solicitante. 
     */
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @Column({
        comment: t`Registro Geral`,
        nullable: true
    })
    registroGeralRepublicaBrasileira?: string;
    @ApiProperty()
    @Column({
        comment: t`Registro Geral Órgão Emissor`,
        nullable: true
    })
    registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor?: string;
    @ApiProperty()
    @Column({ nullable: true, length: 512 })
    emailPessoal?: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, length: 14 })
    empresa?: string;
    @ApiProperty({ required: false, nullable: true })
    @ManyToMany(() => Endereco)
    @JoinTable()
    endereco?: Endereco[];
    @ApiProperty()
    @ManyToMany(() => InformacaoContato)
    @JoinTable()
    informacoesContato?: InformacaoContato[];
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, length: 512 })
    site?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, enum: ['F', 'J'], length: 1 })
    tipoJuridico?: string;

    @ApiProperty()
    @ManyToMany(() => DocumentoIdentificacao)
    documentos: DocumentoIdentificacao;
}