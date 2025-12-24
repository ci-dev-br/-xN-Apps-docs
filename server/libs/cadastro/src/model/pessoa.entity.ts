import { FullAuditedEntity } from "@ci/core";
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany
} from "typeorm";
import { Endereco } from "./endereco.entity";
import {
    ApiExtraModels,
    ApiProperty,
    ApiTags
} from "@nestjs/swagger";
import { InformacaoContato } from "./informacao-contato.entity";
import { DocumentoIdentificacao } from "./documento-identificacao.entity";
import { t } from "@ci/core";
import { schema } from "./schema";
/**
 * Cadastro de Pessoa,
 *  Entidade Física ou Jurídica,
 *  representada,
 *  ou não por instituição de outrem
 * 
 */
@Entity({ schema })
export class Pessoa extends FullAuditedEntity {
    /**
     * Nome
     */
    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Nome',
        description: 'Nome'
    })
    @Column({
        nullable: true,
        length: 120
    })
    nome?: string;
    /**
     * Sobrenome
     */
    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Sobrenome',
        description: 'Sobrenome'
    })
    @Column({
        nullable: true,
        length: 120
    })
    sobrenome?: string;
    /**
     * Nome de Batismo ou Preferido em Origem
     */
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Razão Social',
    })
    @Column({
        length: 120,
        nullable: true
    })
    razaoSocial?: string;
    /**
     * Nome de Apresentação em Documentos Vinculados
     */
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome Fantasia',
    })
    @Column({
        length: 120,
        nullable: true
    })
    nomeFantasia?: string;
    /**
     * Registro Geral em Caso de Pessoa Física registrada em território Brasileiro de acordo com a Constituição Federal. Obrigatório em casos de recolhimentos automatizados de documentos juntos ao estado. Sendo opcional para casos de alimentação manual de base. Esse documento se torna obrigatório em caso de automações junto ao estado em nome do próprio requerente. Sendo obrigatório a autorização direta do uso de seus dados. Com cancelamento ativo por parte do sistema em contato direto com o solicitante. 
     */
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Registro Geral',
        description: 'Registro Geral em Caso de Pessoa Física registrada em território Brasileiro de acordo com a Constituição Federal. Obrigatório em casos de recolhimentos automatizados de documentos juntos ao estado. Sendo opcional para casos de alimentação manual de base. Esse documento se torna obrigatório em caso de automações junto ao estado em nome do próprio requerente. Sendo obrigatório a autorização direta do uso de seus dados. Com cancelamento ativo por parte do sistema em contato direto com o solicitante. '
    })
    @Column({
        comment: t`Registro Geral`,
        nullable: true
    })
    registroGeralRepublicaBrasileira?: string;
    @ApiProperty({
        title: t`RG Ógão Emissor`,
        nullable: true,
        required: false
    })
    @Column({
        comment: t`Registro Geral Órgão Emissor`,
        nullable: true
    })
    registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor?: string;
    @ApiProperty({
        title: t`E-mail pessoal`,
        nullable: true,
        required: false,
        format: 'email'
    })
    @Column({
        nullable: true,
        length: 512
    })
    emailPessoal?: string;
    /** 
     * Nome da empresa vinculada
     */
    @ApiProperty({
        title: t`Empresa`,
        required: false,
        nullable: true,
    })
    @Column({
        nullable: true,
        length: 14
    })
    empresa?: string;
    /**
     * Informação de Endereço
     */
    @ApiProperty({
        title: t`Endereço`,
        required: false,
        nullable: true,
        type: Endereco,
        isArray: true,
    })
    @ManyToMany(() => Endereco)
    @JoinTable()
    endereco?: Endereco[];
    /**
     * Informação de Contato
     */
    @ApiProperty({
        nullable: true,
        required: false,
        title: t`Informações de Contato`,
        type: InformacaoContato,
        isArray: true,
    })
    @ManyToMany(() => InformacaoContato)
    @JoinTable()
    informacoesContato?: InformacaoContato[];
    /**
     * Site
     */
    @ApiProperty({
        title: 'Website Institucional ou Portfólio',
        nullable: true,
        required: false
    })
    @Column({
        nullable: true,
        length: 512
    })
    site?: string;
    @ApiProperty({
        title: t`Típo de Representação Jurídica`,
        nullable: true,
        required: false,
        enum: ['F', 'J']
    })
    @Column({
        nullable: true,
        enum: ['F',
            'J'],
        length: 1
    })
    tipoJuridico?: string;
    /**
     * Documentos de identificação
     */
    @ApiProperty({
        title: 'Documentos de Identificação',
        nullable: true,
        required: false,
        type: DocumentoIdentificacao,
        isArray: true,
    })
    @OneToMany(() => DocumentoIdentificacao, documento => documento.pessoa)
    @JoinTable()
    documentos?: DocumentoIdentificacao[];
}