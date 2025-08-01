import { Column, Entity, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Banco } from './banco.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FullAuditedEntity } from '@ci/manager';
import { schema } from './schema';
@Entity({ schema })
export class ContaBancaria extends FullAuditedEntity {
    @ApiProperty({
        title: 'Banco',
        nullable: false, required: true
    })
    @ManyToOne(() => Banco)
    @JoinTable()
    bank: Banco;
    @ApiProperty({
        title: 'Agência',
        nullable: false, required: true
    })
    @Column({ nullable: false, unique: true })
    agency: string;
    @ApiProperty({
        title: 'Owner Name (?)',
        nullable: false
    })
    @Column({ nullable: false })
    ownerName: string;
    @ApiProperty({
        title: 'CNPJ ou CPJ ',
        nullable: false
    })
    @Column({
        nullable: false
    })
    cpfCnpj: string;
    @ApiProperty({
        title: 'Conta',
        nullable: false
    })
    @Column({ nullable: false, unique: true })
    account: string;
    @ApiProperty({
        title: '(DV)',
        nullable: false
    })
    @Column({ nullable: false, unique: true })
    accountDigit: string;
    @ApiProperty({
        title: 'Tipo de conta Bancária',
        nullable: false
    })
    @Column({
        nullable: false, enum: [
            'CONTA_CORRENTE', 'CONTA_POUPANCA'
        ]
    })
    bankAccountType: "CONTA_CORRENTE" | "CONTA_POUPANCA";
}