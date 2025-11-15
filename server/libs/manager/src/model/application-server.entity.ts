import { ApiProperty } from "@nestjs/swagger";
// import { FullAuditedEntity } from "@ci/core"
import { Column, CreateDateColumn, Entity } from "typeorm";
import { FullAuditedEntity } from "../dao/entities";
import { schema } from "../noms";
/**
 * Registro de aplicação. O registro da aplicação é necessário para a troca interna de 
 * informalções geradas no sistema de chaves e acessos
 * 
 */
@Entity({ schema })
export class ApplicationServer extends FullAuditedEntity {
    @ApiProperty({
        description: 'Endereço de entrada para comunicação  HTTP/HTTPS',
        example: 'https://exemplo.meusite.com.br/api/hooks/',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    endpoint?: string;
    @ApiProperty({
        description: 'Descrição do Serviço de Aplicação',
        example: ''
    })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({
        description: 'Porta da Aplicação',
        example: '666'
    })
    @Column({ nullable: true })
    port?: string;
    @ApiProperty({
        description: 'Status da Aplicação',
        example: 'online'
    })
    @Column({ nullable: true })
    status?: string;
}