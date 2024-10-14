import { ApiProperty } from "@nestjs/swagger";
// import { FullAuditedEntity } from "@ci/core"
import { Column, Entity } from "typeorm";
import { FullAuditedEntity } from "../dao";
import { schema } from "../noms";

/**
 * 
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
}