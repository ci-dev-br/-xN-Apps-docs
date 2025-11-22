import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { InformacaoContato } from "../cadastro.module";

export class ObterListaInformacaoContato {
    // override data?: InformacaoContato;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<InformacaoContato>[] | FindOptionsWhere<InformacaoContato>;
}
