import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "../noms";

@Entity({
    schema
})
export class ClientVersionCatalog {
    @ApiProperty({
        title: 'Hash de Versão',
        description: 'Hash da versão do cliente que foi catalogada (ex: git short hash ou full hash).',
    })
    @PrimaryColumn()
    versionHash: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Branch do Git',
    })
    @Column({
        nullable: true
    })
    branch?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Colaboradores',
        description: 'Lista de colaboradores e autores do commit desta versão.',
    })
    @Column({
        nullable: true,
        type: 'varchar',
        array: true
    })
    collaborators?: string[];

    @ApiProperty({
        title: 'Data da Catalogação',
    })
    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    catalogedAt: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Usuário MASTER Responsável',
        description: 'Identificador do usuário com papel MASTER que efetuou a catalogação desta versão.',
    })
    @Column({
        nullable: true
    })
    catalogedBy?: string;

    @ApiProperty({
        title: 'Quantidade de Aplicações',
        description: 'Total de aplicações catalogadas nesta versão.',
    })
    @Column({
        type: 'int',
        default: 0
    })
    appCount: number;
}
