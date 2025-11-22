import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Pessoa } from "../cadastro.module";

export class ObterListaPessoa {
    // override data?: Pessoa;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Pessoa>[] | FindOptionsWhere<Pessoa>;
}
