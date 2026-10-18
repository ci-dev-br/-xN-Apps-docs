import { ApiProperty } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { Category } from "../model/category.entity";

export class ObterListaCategory {
    // override data?: Category;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: Category })
    where?: FindOptionsWhere<Category>[] | FindOptionsWhere<Category>;
    @ApiProperty({ required: false, nullable: true, type: Category })
    filter?: Partial<Category>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}
