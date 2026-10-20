import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../noms";

/**
 * Entidade de Registro de Consumo / Uso de Aplicação
 * Tombada no banco sempre que uma aplicação é utilizada/executada no sistema.
 */
@Entity({
    schema
})
export class ApplicationConsumption {
    @ApiProperty({
        title: 'ID do Registro de Consumo',
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({
        title: 'Chave da Aplicação',
        description: 'Chave identificadora da aplicação consumida (ex: Mensagens, Financeiro)',
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
    @Index()
    applicationId?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ID do Usuário Consumidor',
        description: 'Usuário que executou ou realizou requisição para a aplicação',
    })
    @Column({ nullable: true })
    @Index()
    userId?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Tenant ID',
    })
    @Column({ nullable: true })
    @Index()
    tenantId?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Hash de Versão Git no Momento do Uso',
    })
    @Column({ nullable: true })
    gitVersionHash?: string;

    @ApiProperty({
        title: 'Quantidade de Autores Creditados com Gratidão',
    })
    @Column({ type: 'int', default: 0 })
    gratitudeCreditedCount: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Metadados do Consumo',
        description: 'Dados contextuais adicionais da requisição ou ambiente de execução',
    })
    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @ApiProperty({
        title: 'Data do Consumo',
    })
    @CreateDateColumn()
    createdAt?: Date;
}
