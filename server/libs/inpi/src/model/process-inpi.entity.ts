import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PrazoINPI } from './prazo-inpi.entity';
import { AtivoIntelectual } from './ativo-intelectual.entity';
import { ClienteINPI } from './cliente-inpi.entity';
import { StatusProcesso } from './status-processo';

import { schema } from "./schema";
@Entity({ schema })
export class ProcessoINPI {
    @ApiProperty({ description: 'ID do processo' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Número oficial do processo no INPI' })
    @Column({ unique: true })
    numeroProcesso: string;

    @ApiProperty({ enum: StatusProcesso, description: 'Status atual do processo' })
    @Column({ type: 'enum', enum: StatusProcesso, default: StatusProcesso.EM_ANALISE })
    status: StatusProcesso;

    @ApiProperty({ description: 'Data do depósito (início) do processo' })
    @CreateDateColumn()
    dataDeposito: Date;

    // Relacionamento: UM processo tem UM ativo (Marca ou Patente)
    @ApiProperty({
        description: 'O ativo (marca ou patente) sendo protegido por este processo',
        type: () => AtivoIntelectual,
    })
    @OneToOne(() => AtivoIntelectual, (ativo) => ativo.processo, {
        cascade: true, // Cria o ativo junto com o processo
        eager: true, // Sempre carrega o ativo ao buscar o processo
    })
    @JoinColumn() // ProcessoINPI terá a coluna 'ativoId'
    ativo: AtivoIntelectual; // Pode ser Marca ou Patente

    // Relacionamento: UM processo tem MUITOS prazos (agenda)
    @ApiProperty({
        description: 'Agenda de prazos e tarefas do processo',
        type: () => [PrazoINPI],
    })
    @OneToMany(() => PrazoINPI, (prazo) => prazo.processo, {
        cascade: true, // Cria os prazos junto
        eager: true, // Sempre carrega os prazos
    })
    prazos: PrazoINPI[];

    // Relacionamento: Muitos processos pertencem a UM cliente
    @ApiProperty({ type: () => ClienteINPI })
    @ManyToOne(() => ClienteINPI, (cliente) => cliente.processos)
    cliente: ClienteINPI;
}