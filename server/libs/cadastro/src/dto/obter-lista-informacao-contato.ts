import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { InformacaoContato } from "../cadastro.module";

export class ObterListaInformacaoContato {
    // override data?: InformacaoContato;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: InformacaoContato })
    where?: FindOptionsWhere<InformacaoContato>[] | FindOptionsWhere<InformacaoContato>;
    @ApiProperty({ required: false, nullable: true, type: InformacaoContato })
    filter?: Partial<InformacaoContato>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}
