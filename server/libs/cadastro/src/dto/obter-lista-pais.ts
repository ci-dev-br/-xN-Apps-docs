import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Pais } from "../model/pais.entity";

export class ObterListaPais {
    // override data?: Pais;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: Pais })
    where?: FindOptionsWhere<Pais>[] | FindOptionsWhere<Pais>;
    @ApiProperty({ required: false, nullable: true, type: Pais })
    filter?: Partial<Pais>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}
