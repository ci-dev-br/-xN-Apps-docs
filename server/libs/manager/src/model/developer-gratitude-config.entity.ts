import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { schema } from "../noms";

/**
 * Configuração de Perfil de Gratidão do Desenvolvedor
 * Permite que cada usuário com ROLE DEVELOPER configure quanto vale cada crédito
 * de gratidão (em R$), o que é considerado para calcular o saldo financeiro a ser creditado.
 */
@Entity({
    schema
})
export class DeveloperGratitudeConfig {
    @ApiProperty({
        title: 'ID do Usuário Desenvolvedor',
    })
    @PrimaryColumn('uuid')
    developerUserId: string;

    @ApiProperty({
        title: 'Valor Unitário da Gratidão (R$)',
        description: 'Quanto vale cada unidade de gratidão recebida pelo desenvolvedor ao converter em saldo.',
        default: 0.10,
    })
    @Column({ type: 'numeric', precision: 14, scale: 4, default: 0.10 })
    unitValue: number;

    @ApiProperty({
        title: 'Conversão Automática em Saldo',
        description: 'Se habilitado, converte os créditos de gratidão diretamente para a carteira financeira a cada consumo.',
        default: false,
    })
    @Column({ default: false })
    autoConvert: boolean;

    @ApiProperty({
        title: 'Data de Atualização da Configuração',
    })
    @UpdateDateColumn()
    updatedAt?: Date;
}
