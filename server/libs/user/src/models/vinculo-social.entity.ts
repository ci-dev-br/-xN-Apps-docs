import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@ci/auth/models/user.entity';

/**
 * Tipos de vínculo social entre usuários do sistema:
 * - SEGUIDOR: relação unidirecional (usuário A segue B).
 * - CONHECIDO: relação bidirecional mútua (usuário A segue B e B segue A de volta).
 */
export enum TipoVinculoSocial {
    SEGUIDOR = 'SEGUIDOR',
    CONHECIDO = 'CONHECIDO',
}

/**
 * Entidade que representa o vínculo social entre usuários.
 * Permite que usuários sigam outros usuários descobertos em interações
 * (como comentários em notícias), gerando seguidores e conhecidos mútuos.
 */
@Entity()
@Unique(['seguidor', 'seguido'])
export class VinculoSocial {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * O usuário que está seguindo
     */
    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    seguidor: User;

    /**
     * O usuário que é seguido
     */
    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    seguido: User;

    /**
     * Tipo do vínculo social:
     * - SEGUIDOR: Usuário A segue B, mas B ainda não segue A de volta.
     * - CONHECIDO: Usuário A segue B e Usuário B também segue A (conexão recíproca/mútua).
     */
    @ApiProperty({ enum: TipoVinculoSocial, default: TipoVinculoSocial.SEGUIDOR })
    @Column({ type: 'varchar', default: TipoVinculoSocial.SEGUIDOR })
    tipo: TipoVinculoSocial;

    @ApiProperty()
    @CreateDateColumn()
    criadoEm: Date;

    @ApiProperty()
    @UpdateDateColumn()
    atualizadoEm: Date;
}
