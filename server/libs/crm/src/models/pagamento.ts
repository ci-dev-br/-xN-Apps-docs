import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { Agendamento } from "./agendamento";
import { VendaProduto } from "./venda-produto";
import { Atendimento } from "./atendimento";
import { ClienteCrm } from "./cliente";
import { FullAuditedEntity } from "@ci/manager";
import { FormaPagamento } from "./forma-pagamento";
import { StatusPagamento } from "./status-pagamento";

@Entity({
    schema
})
export class Pagamento extends FullAuditedEntity {

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    agendamentoId?: number;

    @OneToOne(() => Agendamento, (agendamento) => agendamento.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'agendamento_id' })
    agendamento?: Agendamento;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    vendaProdutoId?: number;

    @OneToOne(() => VendaProduto, (vendaProduto) => vendaProduto.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'venda_produto_id' })
    vendaProduto?: VendaProduto;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    atendimentoId?: number;

    @OneToOne(() => Atendimento, (atendimento) => atendimento.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'atendimento_id' })
    atendimento?: Atendimento;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => ClienteCrm, (cliente) => cliente.pagamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: ClienteCrm;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({  })
    dataPagamento: Date;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @ApiProperty({ enum: FormaPagamento })
    @Column({ type: 'enum', enum: FormaPagamento })
    formaPagamento: FormaPagamento;

    @ApiProperty({})
    @Column({ type: 'enum', enum: StatusPagamento, default: StatusPagamento.PENDENTE })
    status: StatusPagamento;

    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    numeroTransacao?: string;

    @CreateDateColumn()
    dataCriacao: Date;

    @UpdateDateColumn()
    dataAtualizacao: Date;
}