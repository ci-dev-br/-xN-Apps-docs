import {
    ApiProperty
} from "@nestjs/swagger";
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {
    Domain
} from "./domain.entity";
import {
    schema
} from "../noms";
import {
    User
} from "@ci/auth/models/user.entity";

/**
 *  * Entidade de Aplicação
 *
 * Esta entidade representa uma aplicação dentro do sistema, contendo informações
 * como URL, nome, descrição, ícones, domínios associados e usuários relacionados
 * a diferentes níveis de permissão (hoster, desenvolvedores, gerentes, mestres, administradores e usuários).
 *
 * As aplicações são a base para a organização e gerenciamento de serviços e funcionalidades.
 
 * @xNê(
 *     {{:file:c:\x\(*).module.ts:(imports:[)
 *         Application:@AutoImport.request
 *     }}?
 * );
 *
 */
@Entity({
    schema
})
export class Application {
    @ApiProperty({
        nullable: true,
        required: false,
        uniqueItems: true,
        title: 'Chave Interna',
        description: 'ID interno da aplicação. Este ID é gerado automaticamente e é usado para identificar a aplicação de forma única no sistema.',
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Chave da Aplicação',
        description: 'Chave única associada à rota da aplicação no cliente (ex: Mensagens, Arquivos, Cadastros).',
    })
    @Column({
        nullable: true,
        unique: true,
    })
    appKey?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Rota da Aplicação',
        description: 'Caminho da rota registrado no painel do cliente (ex: /Mensagens, /Arquivos).',
    })
    @Column({
        nullable: true,
    })
    routePath?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Hash de Versão Git',
        description: 'Hash do commit Git originário da última execução ou catalogação da aplicação.',
    })
    @Column({
        nullable: true,
    })
    gitVersionHash?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Status Ativo',
        description: 'Determina se a aplicação está ativa e disponível para carregamento na plataforma.',
        default: true,
    })
    @Column({
        default: true,
    })
    isActive?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Tenants Permitidos',
        description: 'Lista de IDs de tenants com permissão para carregar esta aplicação. Se vazio ou nulo, liberado a todos.',
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true,
    })
    allowedTenantIds?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Colaboradores',
        description: 'Lista de desenvolvedores e colaboradores do repositório/aplicação.',
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true,
    })
    collaborators?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Caminho da Pasta do Código',
        description: 'Localização da pasta do repositório onde reside o código da aplicação.',
    })
    @Column({
        nullable: true,
    })
    folderPath?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Autores dos Commits',
        description: 'Lista de autores que realizaram commits dentro da pasta da aplicação.',
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true,
    })
    authors?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Co-autores dos Commits',
        description: 'Lista de co-autores identificados nas mensagens dos commits da pasta da aplicação.',
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true,
    })
    coAuthors?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Quantidade de Commits na Pasta',
        description: 'Total de commits registrados para a pasta desta aplicação.',
    })
    @Column({
        nullable: true,
        type: 'int',
        default: 0,
    })
    commitCount?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Data do Último Commit',
        description: 'Data do último commit registrado na pasta da aplicação.',
    })
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    lastCommitDate?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Trava do Catálogo',
        description: 'Quando verdadeiro, impede que a catalogação automática sobrescreva customizações manuais feitas por administradores.',
        default: false,
    })
    @Column({
        default: false,
    })
    isCatalogLocked?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Políticas de Contexto',
        description: 'Regras e metadados contextuais (ex: versão mínima, recursos exigidos, restrições de planos).',
    })
    @Column({
        type: 'jsonb',
        nullable: true,
    })
    contextPolicies?: Record<string, any>;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Módulos Integrados',
        description: 'Lista de módulos ou aplicações padrão contidos e combinados nesta aplicação.',
        type: 'string',
        isArray: true,
        format: 'chips-autocomplete',
        enum: [
            'CRM',
            'Cadastros',
            'Financeiro',
            'Vendas',
            'Produtos',
            'Mensagens',
            'Organizacao',
            'Projetos',
            'Arquivos',
            'Formularios',
            'CMS',
            'LowCode',
            'Dynamic',
            'Treinamento',
            'DevTools',
            'Codex',
            'SEO',
            'Threejs',
            'Grupos'
        ],
        example: ['CRM', 'Cadastros', 'Financeiro', 'Vendas', 'Mensagens']
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true,
    })
    modules?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Primeira Catalogação',
        description: 'Data e hora da primeira execução/catalogação da aplicação.',
    })
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    firstSeenAt?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Última Execução Registrada',
        description: 'Data e hora da última requisição assinada ou execução detectada.',
    })
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    lastSeenAt?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Endereço URL',
        description: 'O endereço URL principal da aplicação. Este é o ponto de acesso externo para a aplicação.',
    })
    @Column({
        nullable: true
    })
    url?: string;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ícone',
        description: 'Ícone da aplicação',
    })
    @Column({
        nullable: true
    })
    icon?: string;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Logo da aplicação',
        description: 'Logo da aplicação'
    })
    @Column({
        nullable: true
    })
    logo?: string;
    @ApiProperty({
        title: 'Nome',
        nullable: true,
        required: false,
        description: 'O nome da aplicação. Este nome é exibido aos usuários e é usado para identificação.',
    })
    @Column({
        nullable: true
    })
    name?: string;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Descrição',
        description: 'A descrição detalhada da aplicação.'
    })
    @Column({
        nullable: true
    })
    description?: string;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Papéis'
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true
    })
    roles?: string[];
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Domínio',
        type: Domain,
    })
    @ManyToOne(() => Domain)
    @JoinTable()
    domain?: Domain;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Grupo'
    })
    @Column({
        default: 'global',
        length: 13
    })
    menuGroupName: string;
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Categoria',
        description: `A categoria à qual a aplicação pertence. Isso ajuda na organização e filtragem das aplicações.`
    })
    @Column({
        length: 30,
        nullable: true
    })
    categoria: string;
    @ApiProperty({
        title: 'Domínios Associados',
        description: 'Adicione os domínios que podem responder por esta aplicação.',
        type: Domain,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => Domain,
        domain => domain.aplications)
    domains: Domain[];
    @ApiProperty({
        title: 'Hoster da Aplicação',
        description: 'Usuário responsável pelo hosteamento da aplicação.',
        type: User,
        nullable: true,
        required: false,
    })
    @ManyToOne(type => User)
    hoster?: User;
    /**
     * Usuários Responsáveis técnicos pelo código-fonte.
     */
    @ApiProperty({
        title: 'Desenvolvedores',
        description: 'Usuários com permissão de alteração no código fonte do sistema de forma direta inretristiva.',
        type: User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => User)
    @JoinTable()
    responsibility?: User[];
    /**
     * Usuários com permissão de gestão dos dados gerados pelos sistema,
     *  pemitindo vetação ou ajuste manual,
     *  dentre duas permissões e acessos específicos,
     *  permissivos ou restritivos.
     */
    @ApiProperty({
        title: 'Gerenciadores',
        description: `Usuários com permissão de gestão dos  dados gerados pelos sistema, pemitindo vetação ou ajuste manual, dentre duas permissões e acessos específicos, permissivos ou restritivos.`,
        type: User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => User)
    @JoinTable()
    managers?: User[];
    /**
     * Usuários que podem administrar as permissões de acessos da aplicação
     */
    @ApiProperty({
        title: 'Master User',
        description: `Usuários que podem administrar as permissões de acessos da aplicação.`,
        type: User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => User)
    @JoinTable()
    masters?: User[];
    /**
     * Usuários que podem gerenciar e criar usuários para as aplicações e liberar licenças de uso
     */
    @ApiProperty({
        title: 'Administradores da Aplicação',
        description: 'Usuáriso administradores são responsáveis pelo gerenciamento de acesso dos usuários aos dados gerados pelo sistema.',
        type: User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => User)
    @JoinTable()
    administrators?: User[];
    @ApiProperty({
        title: 'Usuários da Aplicação',
        description: 'Os usuários da aplicação são aqueles que fizeram registro ou possuem licença de uso da aplicação. Algumas aplicações podem exigir licença para uso de módulos específicos.',
        type: User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => User)
    @JoinTable()
    users?: User[];
}