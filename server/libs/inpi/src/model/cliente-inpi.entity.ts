import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessoINPI } from './process-inpi.entity';

@Entity({ schema: 'INPI' })
export class ClienteINPI {
    @ApiProperty({ description: 'ID do cliente' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Nome do cliente' })
    @Column()
    nome: string;

    // Relacionamento: UM cliente pode ter MUITOS processos
    @ApiProperty({ type: () => [ProcessoINPI] })
    @OneToMany(() => ProcessoINPI, (processo) => processo.cliente)
    processos: ProcessoINPI[];
}