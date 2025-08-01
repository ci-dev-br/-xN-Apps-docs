import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../shema";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Registro de Log no sistema
 */
@Entity({ schema }) export class Log {
    @PrimaryGeneratedColumn('uuid') internalId: string;
    @ApiProperty({ title: 'Chave de Acesso', required: false })
    @Column({ nullable: true, })
    chaveAcesso?: string;
    @ApiProperty({ title: 'Registro de Log', required: false })
    @Column({ type: 'jsonb' })
    log: any;
    @ApiProperty({ required: false })
    @Column({ nullable: true })
    level: string;
    @CreateDateColumn()
    cratedAt?: Date;
    @ApiProperty({ required: false })
    @Column({ nullable: true })
    origem?: string;
    @ApiProperty({ required: false })
    @Column({ nullable: true })
    application?: string;
}