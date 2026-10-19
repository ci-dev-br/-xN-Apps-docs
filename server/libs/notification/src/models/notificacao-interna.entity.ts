import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "./schema";

@Entity({ schema })
export class NotificacaoInterna {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id!: string;

    @Column()
    @Index()
    @ApiProperty({ description: 'ID do usuário destinatário da notificação' })
    userId!: string;

    @Column()
    @ApiProperty({ description: 'Título da notificação' })
    title!: string;

    @Column({ type: 'text' })
    @ApiProperty({ description: 'Corpo/mensagem da notificação' })
    message!: string;

    @Column({ default: 'INFO' })
    @ApiProperty({ description: 'Tipo da notificação: MENSAGEM, GRUPO, SISTEMA, INFO, AVISO' })
    type!: string;

    @Column({ default: false })
    @ApiProperty({ description: 'Status de leitura da notificação' })
    read!: boolean;

    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true, description: 'URL de ação rápida para navegar ao clicar' })
    actionUrl?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ required: false, nullable: true, description: 'Metadados adicionais em formato JSON string' })
    metadata?: string;

    @CreateDateColumn()
    @ApiProperty()
    createdAt!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updatedAt!: Date;
}
