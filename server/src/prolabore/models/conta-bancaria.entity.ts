import { Column, Entity, JoinTable, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Banco } from './banco.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ContaBancaria {
    @ApiProperty({ nullable: false})
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({ nullable: false, required: true})
    @OneToOne(() => Banco)
    @JoinTable()
    bank: Banco;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    agency: string;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    ownerName: string;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    cpfCnpj: string;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    account: string;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    accountDigit: string;
    @ApiProperty({ nullable: false, required: true})
    @Column({ nullable: false})
    bankAccountType: "CONTA_CORRENTE" | "CONTA_POUPANCA";
}