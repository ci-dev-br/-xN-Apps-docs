import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";
/**
 * Entidade de Política de Autenticação.
 */
@Entity()
export class Policy {
    /**
     * Código único da política de autenticação.
     */
    @ApiProperty({ uniqueItems: true })
    @PrimaryColumn()
    code?: string;
    /**
     * Descrição da política de autenticação.
     */
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
}