import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Ativo do sistema (Noticiário Diário, Formulário, Cadastro ou Documento)
 * compartilhado com o Grupo via Tenant ID.
 * Ao vincular o tenantId do grupo ao ativo, qualquer usuário membro do grupo
 * (que possui o tenantId no seu perfil) pode acessar e interagir com o ativo.
 */
@Entity()
export class GrupoAtivoCompartilhado {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'ID do grupo' })
    @Column()
    grupoId: string;

    @ApiProperty({ description: 'ID do tenant do grupo que concede visibilidade aos membros' })
    @Column()
    tenantId: string;

    @ApiProperty({ enum: ['NOTICIA', 'FORMULARIO', 'CADASTRO', 'DOCUMENTO', 'OUTRO'], default: 'NOTICIA' })
    @Column({ default: 'NOTICIA' })
    tipoAtivo: 'NOTICIA' | 'FORMULARIO' | 'CADASTRO' | 'DOCUMENTO' | 'OUTRO';

    @ApiProperty({ description: 'ID original do ativo compartilhado' })
    @Column()
    ativoId: string;

    @ApiProperty({ description: 'Título do ativo compartilhado' })
    @Column()
    titulo: string;

    @ApiProperty({ nullable: true, description: 'Descrição ou resumo do ativo' })
    @Column({ nullable: true, type: 'text' })
    descricao?: string;

    @ApiProperty({ nullable: true, description: 'URL ou rota de acesso ao ativo' })
    @Column({ nullable: true })
    url?: string;

    @ApiProperty({ nullable: true, description: 'Metadados adicionais em JSON (ex: dados do formulário ou notícia)' })
    @Column({ nullable: true, type: 'jsonb' })
    metadados?: any;

    @ApiProperty({ description: 'ID do usuário que realizou o compartilhamento' })
    @Column()
    compartilhadoPorId: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    compartilhadoPorNome?: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true, type: 'text' })
    compartilhadoPorPhoto?: string;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}
