import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Endereco } from "../cadastro.module";

export class ObterListaEndereco {
    // override data?: Endereco;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: Endereco })
    where?: FindOptionsWhere<Endereco>[] | FindOptionsWhere<Endereco>;
    @ApiProperty({ required: false, nullable: true, type: Endereco })
    filter?: Partial<Endereco>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
    @ApiProperty({ required: false, nullable: true })
    relations?: any;
}
