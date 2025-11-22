import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Pais } from "../model/pais.entity";

export class ObterListaPais {
    // override data?: Pais;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Pais>[] | FindOptionsWhere<Pais>;
}
