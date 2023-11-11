import { Column, Entity, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Banco } from './banco.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ContaBancaria {
    @ApiProperty({ nullable: false })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({ nullable: false, required: true })
    @ManyToOne(() => Banco)
    @JoinTable()
    bank: Banco;
    @ApiProperty({ nullable: false, required: true })
    @Column({ nullable: false, unique: true })
    agency: string;
    @ApiProperty({ nullable: false })
    @Column({ nullable: false })
    ownerName: string;
    @ApiProperty({ nullable: false })
    @Column({ nullable: false })
    cpfCnpj: string;
    @ApiProperty({ nullable: false })
    @Column({ nullable: false, unique: true })
    account: string;
    @ApiProperty({ nullable: false })
    @Column({ nullable: false, unique: true })
    accountDigit: string;
    @ApiProperty({ nullable: false })
    @Column({
        nullable: false, enum: [
            'CONTA_CORRENTE', 'CONTA_POUPANCA'
        ]
    })
    bankAccountType: "CONTA_CORRENTE" | "CONTA_POUPANCA";
}