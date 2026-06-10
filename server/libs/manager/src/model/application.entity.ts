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