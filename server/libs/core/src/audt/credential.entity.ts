import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, TableForeignKey } from "typeorm";
import { Application } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
// import { User } from "@ci/auth/models/user.entity";
import { schema } from "../schema";
@Entity(
    {
        schema
    }
)
export class Credential {
    @ApiProperty({ required: false }) @PrimaryGeneratedColumn('uuid') id?: string;
    @ApiProperty({ required: false }) @Column({ nullable: true }) identifiedUser?: string;
    @ApiProperty({ required: false }) @CreateDateColumn() createdAt?: Date;
    @ApiProperty({ required: false }) @ManyToMany(() => Application) @JoinTable() application?: Application;
    @ApiProperty({ required: false }) @Column({ nullable: true }) createdFromIp?: string;
    /**
     * A chave de acesso é considerada válida quando pode ser utilizada para gerar uma nova chave de acesso. A quantidade de chaves de acesso válidas é limitada segundo a política de segurança da aplicação. A chave de acesso é considerada inválida quando o usuário não pode gerar uma nova chave de acesso.
     */
    @Column({ nullable: true, default: false }) valid?: boolean;
    /**
     * A chave de acesso é considerada viva quando o usuário está autenticado na aplicação.
     */
    @Column({ nullable: true, default: false }) alive?: boolean;
    @Column({ nullable: true }) refreshToken?: string;
    @ApiProperty({ required: false, nullable: true })
    user?: any;
}