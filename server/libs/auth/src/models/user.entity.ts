import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Policy } from "./policy.entity";
import { Tenant } from "@ci/tenant/models/tenant.entity";
// import { Photo } from "@ci/storage/models/photo.entity";
/**
 *	Usuário Auto-identificado do Sistema
 */
@Entity()
export class User {
    /**
     * Identificador único do usuário
     */
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    /**
     * Nome de Usuário (Login)
     */
    @Column({ unique: true })
    @ApiProperty({ title: "Nome Usuário", required: false, nullable: true })
    username?: string;
    /**
     * Nome Completo do Usuário
     */
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    fullName?: string;
    /**
     * Nome de Tratamento do Usuário
     */
    @ApiProperty({ title: 'Nome de Tratamento', required: false, nullable: true })
    @Column({ nullable: true })
    surname?: string;
    /**
     * Senha do Usuário
     */
    @Column({ nullable: true })
    @Exclude({ toPlainOnly: true })
    password?: string;
    /**
     * Modo de armazenamento da senha (hash, full-text, etc)
     */
    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true, default: 'full-text' })
    passwordMode?: string;
    /**
     * Endereço de e-mail do Usuário
     */
    @Column({ nullable: true, unique: true })
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    /**
     * Define se o e-mail do usuário foi verificado
     */
    @Column({ nullable: true, default: false })
    @ApiProperty({ required: false, nullable: true })
    emailVerificado?: boolean;
    /**
     * Número de telefone do Usuário
     */
    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
    /**
     * Define se o telefone do usuário foi verificado
     */
    // @ApiProperty({ required: false, nullable: true })
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, type: 'varchar', array: true, default: ['USER'] })
    roles?: string[];
    /**
     * Permissões atribuídas ao usuário
     */
    @ApiProperty({ required: false, nullable: true, isArray: true, type: Policy })
    @ManyToMany(() => Policy) @JoinTable()
    permission?: Policy[];
    /**
     * Token de atualização do usuário
     */
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
    /**
     * Tenants associados ao usuário
     */
    @ApiProperty({ nullable: true, required: false, type: Tenant, isArray: true })
    @ManyToMany(() => Tenant)
    @JoinTable()
    tenants?: Tenant[];
    /**
     * Campo de teste
     */
    @Column({ nullable: true }) teste?: string;
    // @ApiProperty({ nullable: true, required: false, type: Photo })
    // @ManyToOne(() => Photo)
    // @JoinColumn()
    // photo?: Photo;
    @ApiProperty({ required: false, nullable: true }) @CreateDateColumn() createdAt?: Date;
    /**
     * Data de atualização do usuário
     */
    @ApiProperty({ required: false, nullable: true }) @UpdateDateColumn() updatedAt?: Date;
}
