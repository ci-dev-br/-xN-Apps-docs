import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";
/**
 *  Entidade que representa um dispositivo autenticado na plataforma.
 */
@Entity()
export class DeviceAuthenticated {
    /**
     * Identificador único do dispositivo autenticado.
     */
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id: string;
    /**
     * Data do último handshake de autenticação do dispositivo.
     */
    @ApiProperty({})
    @UpdateDateColumn()
    lastAuthenticationHandshake?: Date;
    /**
     * Usuário associado ao dispositivo autenticado.
     */
    @ApiProperty({})
    @OneToOne(() => User)
    @JoinColumn()
    user?: User;
    /**
     * Token de atualização associado ao dispositivo autenticado.
     */
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
}