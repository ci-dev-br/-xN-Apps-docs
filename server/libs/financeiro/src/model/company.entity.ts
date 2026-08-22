import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Asset } from './asset.entity';
import { FinancialStatement } from './financial-statement.entity';
import { schema } from '../norms';
@Entity({ schema })
export class Company {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID Único da Empresa' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Petróleo Brasileiro S.A. - Petrobras', description: 'Nome da Empresa' })
    @Column({ length: 255 })
    name: string;

    @ApiProperty({ example: '33.000.167/0001-01', description: 'CNPJ da Empresa' })
    @Column({ length: 18, unique: true })
    cnpj: string;

    @ApiProperty({ example: '9512', description: 'Código CVM da Empresa' })
    @Column({ name: 'cvm_code', length: 10, unique: true })
    cvmCode: string;

    @ApiProperty({ example: 'Petróleo, Gás e Biocombustíveis', description: 'Setor de Atuação' })
    @Column({ length: 100, nullable: true })
    sector: string;

    @OneToMany(() => Asset, (asset) => asset.company)
    assets: Asset[];

    @OneToMany(() => FinancialStatement, (statement) => statement.company)
    financialStatements: FinancialStatement[];
}