import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../noms";

/**
 * Entidade de Crédito de Gratidão do Desenvolvedor
 * Credita para cada autor/co-autor da aplicação um crédito de gratidão a cada consumo,
 * o qual pode ou não ser convertido em saldo na carteira financeira.
 */
@Entity({
    schema
})
export class DeveloperGratitude {
    @ApiProperty({
        title: 'ID do Crédito de Gratidão',
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({
        title: 'E-mail do Autor / Co-autor',
    })
    @Column()
    @Index()
    authorEmail: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome do Autor / Co-autor',
    })
    @Column({ nullable: true })
    authorName?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ID do Usuário Desenvolvedor',
        description: 'ID da conta de usuário correspondente ao autor no sistema, se cadastrado.',
    })
    @Column({ nullable: true })
    @Index()
    developerUserId?: string;

    @ApiProperty({
        title: 'Chave da Aplicação que Gerou a Gratidão',
    })
    @Column()
    @Index()
    appKey: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ID da Aplicação',
    })
    @Column({ nullable: true })
    applicationId?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ID do Consumo Originário',
    })
    @Column({ nullable: true })
    consumptionId?: string;

    @ApiProperty({
        title: 'Quantidade de Créditos de Gratidão',
        default: 1,
    })
    @Column({ type: 'int', default: 1 })
    credits: number;

    @ApiProperty({
        title: 'Convertido em Saldo Financeiro?',
        description: 'Indica se este crédito já foi convertido em saldo na carteira.',
        default: false,
    })
    @Column({ default: false })
    @Index()
    isConverted: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Data da Conversão em Saldo',
    })
    @Column({ type: 'timestamp', nullable: true })
    convertedAt?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ID da Transação Financeira Gerada',
    })
    @Column({ nullable: true })
    transacaoFinanceiraId?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Valor Financeiro Convertido (R$)',
    })
    @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
    convertedValor?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Valor Unitário da Gratidão na Conversão (R$)',
    })
    @Column({ type: 'numeric', precision: 14, scale: 4, nullable: true })
    unitValueAtConversion?: number;

    @ApiProperty({
        title: 'Data do Crédito',
    })
    @CreateDateColumn()
    createdAt?: Date;
}
