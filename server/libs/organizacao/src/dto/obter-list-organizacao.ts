import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Organizacao } from "../model/organizacao.entity";

export class ObterListaOrganizacao {
    // override data?: Organizacao;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Organizacao>[] | FindOptionsWhere<Organizacao>;
}
