import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, TableForeignKey } from "typeorm";
import type { Application } from "@ci/manager/model/application.entity";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../schema";
@Entity(
    {
        schema
    }
)
export class Credential {
    @ApiProperty({ required: false })
    @PrimaryGeneratedColumn('uuid') id?: string;
    @ApiProperty({ required: false })
    @Column({ nullable: true })
    identifiedUser?: string;
    @ApiProperty({ required: false })
    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({ required: false })
    @ManyToMany(() => require("@ci/manager/model/application.entity").Application) @JoinTable() application?: Application;
    @ApiProperty({ required: false })
    @Column({ nullable: true })
    createdFromIp?: string;
    /**
     * A chave de acesso é considerada válida quando pode ser utilizada para gerar uma nova chave de acesso. A quantidade de chaves de acesso válidas é limitada segundo a política de segurança da aplicação. A chave de acesso é considerada inválida quando o usuário não pode gerar uma nova chave de acesso.
     */
    @Column({ nullable: true, default: false })
    valid?: boolean;
    /**
     * A chave de acesso é considerada viva quando o usuário está autenticado na aplicação.
     */
    @Column({ nullable: true, default: false })
    alive?: boolean;
    @Column({ nullable: true })
    refreshToken?: string;
    /**
     * Chave pública (SPKI em base64 ou JWK) associada a este acesso para validação de assinaturas de snapshots.
     */
    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'text', nullable: true })
    publicKey?: string | null;
    /**
     * Algoritmo da chave pública associada à credencial (ex.: ECDSA-P256-SHA256).
     */
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, length: 64 })
    publicKeyAlgorithm?: string | null;
    /**
     * Impressão digital SHA-256 da chave pública registrada neste acesso.
     */
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, length: 128 })
    publicKeyFingerprint?: string | null;
    @ApiProperty({ required: false, nullable: true })
    user?: any;
}