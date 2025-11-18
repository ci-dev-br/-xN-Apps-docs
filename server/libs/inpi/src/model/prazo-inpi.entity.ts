import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StatusPrazo } from './status-prazo';
import { ProcessoINPI } from './process-inpi.entity';

@Entity({ schema: 'INPI' })
export class PrazoINPI {
    @ApiProperty({ description: 'ID do prazo' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Descrição da tarefa/prazo (ex: Pagar anuidade)' })
    @Column()
    descricao: string;

    @ApiProperty({ description: 'Data de vencimento do prazo' })
    @Column({ type: 'date' })
    dataVencimento: Date;

    @ApiProperty({
        enum: StatusPrazo,
        default: StatusPrazo.PENDENTE,
    })
    @Column({ type: 'enum', enum: StatusPrazo, default: StatusPrazo.PENDENTE })
    status: StatusPrazo;

    @ApiProperty({ description: 'Data em que o prazo foi criado' })
    @CreateDateColumn()
    dataCriacao: Date;

    // Relacionamento: Muitos prazos pertencem a UM processo
    @ApiProperty({ type: () => ProcessoINPI })
    @ManyToOne(() => ProcessoINPI, (processo) => processo.prazos)
    processo: ProcessoINPI;
}