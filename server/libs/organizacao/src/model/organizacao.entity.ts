import { ApiProperty } from "@nestjs/swagger";
import { Pessoa } from "@ci/cadastro/model/pessoa.entity";
import { FullAuditedEntity } from "@ci/core";
import { Photo } from "@ci/storage/models/photo.entity";
import { Tenant } from "@ci/tenant/models/tenant.entity";
import {
    Column,
    Entity,
    JoinTable,
    ManyToOne,
} from "typeorm";
import { schema } from "../termos";
/**
 * Entidade que representa uma Organização Informacional
 */
@Entity({
    schema
})
export class Organizacao extends FullAuditedEntity {
    /**
     * # Organização Name
     */
    @ApiProperty({
        nullable: true,
        required: false,
        description: 'Nome da Organização'
    })
    @Column({
        nullable: true
    })
    organizatioName?: string;
    /**
     * Logo of Organization
     */
    @ApiProperty({
        type: Photo,
        nullable: true,
        required: false,
        description: 'Logomarca da Organização'
    })
    @ManyToOne(type => Photo,
        { nullable: true })
    @JoinTable()
    logo?: Photo;
    /**
     * Tenant is a UUID internal Object identification of Organization
     * 
     * Description:
     *  This field is a foreign key to the Tenant entity.
     */
    @ApiProperty({
        title: 'Tenant',
        description: 'Identificador do Inquilino',
        example: `'40e6215d-b5c6-4896-987c-f30f3678f608'`,
        externalDocs: { url: '' },
        type: Tenant,
        nullable: true,
        required: false
    })
    @ManyToOne(type => Tenant,
        { nullable: true })
    @JoinTable()
    tenant?: Tenant;
    /**
     * Cadastro de Pessoa Física ou Pessoa Jurídica que representa uma determinada Organização
     */
    /**
     * Responsável pelo cadastro da Organização
     */
    @ApiProperty({
        title: 'Responsável pela Organização',
        description: 'Pessoa Responsável pelo cadastro da Organização na Plataforma virtual.',
        type: Pessoa,
        nullable: true,
        required: false
    })
    @ManyToOne(type => Pessoa,
        { nullable: true })
    @JoinTable()
    responsavel?: Pessoa;
}