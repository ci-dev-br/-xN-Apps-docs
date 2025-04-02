import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany } from "typeorm";
import { Agendamento } from "./agendamento";
import { Atendimento } from "./atendimento";
import { CampanhaMarketing } from "./campanha-marketing";
import { HistoricoContato } from "./historico-contato";
import { Pagamento } from "./pagamento";
import { VendaProduto } from "./venda-produto";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class ClienteCrm extends FullAuditedEntity {

    @ApiProperty()
    @Column({ length: 255 })
    nome: string;

    @ApiProperty()
    @Column({ length: 14, nullable: true })
    cpf?: string;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    dataNascimento?: Date;

    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    email?: string;

    @ApiProperty({ maxLength: 20, nullable: true })
    @Column({ length: 20, nullable: true })
    telefone?: string;

    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    endereco?: string;

    @ApiProperty({ maxLength: 100, nullable: true })
    @Column({ length: 100, nullable: true })
    cidade?: string;

    @ApiProperty({ maxLength: 2, nullable: true })
    @Column({ length: 2, nullable: true })
    estado?: string;

    @ApiProperty({ maxLength: 10, nullable: true })
    @Column({ length: 10, nullable: true })
    cep?: string;

    @ApiProperty()
    @CreateDateColumn()
    dataCadastro: Date;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    observacoes?: string;

    @OneToMany(() => Agendamento, (agendamento) => agendamento.cliente)
    agendamentos: Agendamento[];

    @OneToMany(() => Atendimento, (atendimento) => atendimento.cliente)
    atendimentos: Atendimento[];

    @OneToMany(() => HistoricoContato, (historicoContato) => historicoContato.cliente)
    historicoContatos: HistoricoContato[];

    @OneToMany(() => VendaProduto, (vendaProduto) => vendaProduto.cliente)
    vendasProdutos: VendaProduto[];

    @OneToMany(() => Pagamento, (pagamento) => pagamento.cliente)
    pagamentos: Pagamento[];

    @ManyToMany(() => CampanhaMarketing, (campanha) => campanha.clientes)
    campanhasMarketing: CampanhaMarketing[];
}