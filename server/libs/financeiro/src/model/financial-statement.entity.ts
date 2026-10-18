import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { schema } from '../norms';
@Entity({ schema })
export class FinancialStatement {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174002',
        description: 'ID Único da Demonstração Financeira'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-12-31',
        description: 'Data de referência do encerramento do período (Trimestre ou Ano)'
    })
    @Column({ name: 'reference_date', type: 'date' })
    referenceDate: Date;

    @ApiProperty({
        example: 'DFP',
        description: 'Tipo de documento CVM: ITR (Trimestral) ou DFP (Anual)'
    })
    @Column({ name: 'document_type', length: 10 })
    documentType: string;

    @ApiProperty({
        example: 'CONSOLIDADO',
        description: 'INDIVIDUAL ou CONSOLIDADO (Geralmente o mercado usa o Consolidado)'
    })
    @Column({ name: 'statement_type', length: 20, default: 'CONSOLIDADO' })
    statementType: string;

    // --- DADOS DO BALANÇO PATRIMONIAL (BP) ---

    @ApiProperty({ example: 987654321000.00, description: 'Ativo Total' })
    @Column('decimal', { name: 'total_assets', precision: 18, scale: 2, nullable: true })
    totalAssets: number;

    @ApiProperty({ example: 350000000000.00, description: 'Patrimônio Líquido' })
    @Column('decimal', { name: 'equity', precision: 18, scale: 2, nullable: true })
    equity: number;

    @ApiProperty({ example: 150000000000.00, description: 'Dívida Bruta' })
    @Column('decimal', { name: 'gross_debt', precision: 18, scale: 2, nullable: true })
    grossDebt: number;

    // --- DADOS DA DEMONSTRAÇÃO DO RESULTADO (DRE) ---

    @ApiProperty({ example: 500000000000.00, description: 'Receita Líquida' })
    @Column('decimal', { name: 'net_revenue', precision: 18, scale: 2, nullable: true })
    netRevenue: number;

    @ApiProperty({ example: 120000000000.00, description: 'EBITDA (Lucro Antes de Juros, Impostos, Depreciação e Amortização)' })
    @Column('decimal', { precision: 18, scale: 2, nullable: true })
    ebitda: number;

    @ApiProperty({ example: 38000000000.00, description: 'Lucro Líquido do Período' })
    @Column('decimal', { name: 'net_income', precision: 18, scale: 2, nullable: true })
    netIncome: number;

    // --- RELACIONAMENTO ---

    @ApiProperty({ type: () => Company })
    @ManyToOne(() => Company, (company) => company.financialStatements, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'company_id' })
    company: Company;
}