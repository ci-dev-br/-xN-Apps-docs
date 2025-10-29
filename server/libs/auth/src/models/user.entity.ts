import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Policy } from "./policy.entity";
import { Tenant } from "@ci/tenant/models/tenant.entity";
// import { Photo } from "@ci/storage/models/photo.entity";
/**
 *	Usuário Auto-identificado do Sistema
 * */
@Entity()
export class User {
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true })
    @ApiProperty({ title: "Nome Usuário", required: false, nullable: true })
    username?: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    fullName?: string;
    @ApiProperty({ title: 'Nome de Tratamento', required: false, nullable: true })
    @Column({ nullable: true })
    surname?: string;
    @Column({ nullable: true })
    @Exclude({ toPlainOnly: true })
    password?: string;
    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true, default: 'full-text' })
    passwordMode?: string;
    @Column({ nullable: true, unique: true })
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    @Column({ nullable: true, default: false })
    @ApiProperty({ required: false, nullable: true })
    emailVerificado?: boolean;
    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
    // @ApiProperty({ required: false, nullable: true })
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, type: 'varchar', array: true, default: ['USER'] })
    roles?: string[];
    @ApiProperty({ required: false, nullable: true, isArray: true, type: Policy })
    @ManyToMany(() => Policy) @JoinTable()
    permission?: Policy[];
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
    @ApiProperty({ nullable: true, required: false, type: Tenant, isArray: true })
    @ManyToMany(() => Tenant)
    @JoinTable()
    tenants?: Tenant[];
    @Column({ nullable: true }) teste?: string;
    // @ApiProperty({ nullable: true, required: false, type: Photo })
    // @ManyToOne(() => Photo)
    // @JoinColumn()
    // photo?: Photo;
    @ApiProperty({ required: false, nullable: true }) @CreateDateColumn() createdAt?: Date;
    @ApiProperty({ required: false, nullable: true }) @UpdateDateColumn() updatedAt?: Date;
}
