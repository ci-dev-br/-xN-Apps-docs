import { Column, Entity } from "typeorm";
import { FullAuditedEntity } from "../dao";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../noms";
/*@xNê(
        {{:file:c:\x\(*).module.ts:(imports:[)
            DinamycPageView:@AutoImport.request
        }}?
);
*/
/***
 * Página Dinâmica da Aplicação
 * 
 * Permite carregar dinamicamente um recurso, permitindo manipular
 * a injeção de informações que ocorrem no componente no lado do 
 * Cliente da Aplicação.
 * 
 * As paginas dinâmicas são carregadas junto a Identificação do Cliente.
 * 
 * Os recursos de Páginas Dinâmicas também podem ser utilizados para 
 * obstruir o acesso a determinada parte do sistema ou carregar algum 
 * recurso em específico.
 */
@Entity({ schema })
export class DinamycPageView extends FullAuditedEntity {
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    applicationDefaultRoute?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    componentCodename?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    chunkJsUMD?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    chunkJsAMD?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    origin?: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false })
    fakedRouteRequested?: string;
}