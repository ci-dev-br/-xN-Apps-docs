import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Category } from "../model/category.entity";

export class ObterListaCategory {
    // override data?: Category;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Category>[] | FindOptionsWhere<Category>;
}
