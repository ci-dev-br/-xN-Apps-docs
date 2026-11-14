import { Column, Entity, Index, OneToMany } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager/dao/entities";
import { ApiProperty } from "@nestjs/swagger";
import { TransacaoCarteira } from "./transacao-carteira.entity";

/**
 * Entidade de Carteira do Usuário
 * Responsável pela custódia de saldo, depósitos identificados e pagamento de faturas.
 */
@Entity({ schema })
export class Carteira extends FullAuditedEntity {
    @ApiProperty({ title: 'ID do Usuário', description: 'Usuário proprietário da carteira' })
    @Column({ nullable: true })
    @Index()
    userId?: string;

    @ApiProperty({ title: 'Nome da Carteira', description: 'Nome ou identificação da carteira', required: false })
    @Column({ nullable: true, default: 'Carteira Principal' })
    nome?: string;

    @ApiProperty({ title: 'Descrição da Carteira', description: 'Finalidade ou observações da carteira', required: false })
    @Column({ nullable: true })
    descricao?: string;

    @ApiProperty({ title: 'Número da Carteira', description: 'Código único para depósitos identificados' })
    @Column({ nullable: true, unique: true })
    @Index()
    numeroCarteira?: string;

    @ApiProperty({ title: 'Saldo', description: 'Saldo / posição disponível na carteira' })
    @Column({ type: 'numeric', precision: 18, scale: 4, default: 0.00 })
    saldo: number;

    @ApiProperty({ title: 'Tipo de Lastro', enum: ['MOEDA_REAL', 'PARAMETRIZADA'], description: 'Indica se a carteira é lastreada em moeda fiduciária/real ou moeda/ativo parametrizado', default: 'MOEDA_REAL' })
    @Column({ default: 'MOEDA_REAL', length: 30 })
    tipoLastro: 'MOEDA_REAL' | 'PARAMETRIZADA';

    @ApiProperty({ title: 'Moeda / Código do Lastro', description: 'Código da moeda real ou parametrizada (ex: BRL, USD, EUR, BTC, CRD-IA)' })
    @Column({ default: 'BRL', length: 30 })
    moeda: string;

    @ApiProperty({ title: 'Símbolo da Moeda', description: 'Símbolo de exibição da unidade (ex: R$, US$, €, ₿, PTS, TK)', required: false })
    @Column({ nullable: true, default: 'R$', length: 16 })
    simboloMoeda?: string;

    @ApiProperty({ title: 'Nome da Moeda / Lastro', description: 'Nome descritivo da moeda ou ativo parametrizado', required: false })
    @Column({ nullable: true, default: 'Real Brasileiro' })
    nomeMoeda?: string;

    @ApiProperty({ title: 'Fator de Conversão / Cotação de Referência (BRL)', description: 'Valor de referência de 1 unidade desta carteira em R$ (BRL)', required: false })
    @Column({ type: 'numeric', precision: 18, scale: 6, default: 1.000000, nullable: true })
    fatorConversaoBrl?: number;

    @ApiProperty({ title: 'Parâmetros do Lastro', description: 'Configurações avançadas para lastro parametrizado', required: false })
    @Column({ type: 'jsonb', nullable: true })
    parametrosLastro?: {
        indexador?: string;
        casasDecimais?: number;
        permiteSaldoNegativo?: boolean;
        emissor?: string;
        observacoesLastro?: string;
        metaPosicao?: number;
    };

    @ApiProperty({ title: 'Carteira Principal', required: false, default: false })
    @Column({ default: false, nullable: true })
    principal?: boolean;

    @ApiProperty({ title: 'Cor do Tema', required: false, default: 'indigo' })
    @Column({ nullable: true, default: 'indigo', length: 30 })
    corTema?: string;

    @ApiProperty({ title: 'Status', description: 'Status operacional da carteira' })
    @Column({ default: 'ATIVA' })
    status: 'ATIVA' | 'BLOQUEADA' | 'SUSPENSA';

    @ApiProperty({ title: 'Limite Operacional Diário', required: false })
    @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
    limiteDiario?: number;

    @ApiProperty({ title: 'Transações da Carteira', isArray: true, type: () => TransacaoCarteira, required: false })
    @OneToMany(() => TransacaoCarteira, (transacao) => transacao.carteira)
    transacoes?: TransacaoCarteira[];
}
