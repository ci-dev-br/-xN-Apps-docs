import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Endereco } from "../cadastro.module";

export class ObterListaEndereco {
    // override data?: Endereco;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Endereco>[] | FindOptionsWhere<Endereco>;
}
