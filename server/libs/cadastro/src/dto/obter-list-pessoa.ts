import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Pessoa } from "../cadastro.module";

export class ObterListaPessoa {
    // override data?: Pessoa;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: Pessoa })
    where?: FindOptionsWhere<Pessoa>[] | FindOptionsWhere<Pessoa>;
    @ApiProperty({ required: false, nullable: true, type: Pessoa })
    filter?: Partial<Pessoa>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}
