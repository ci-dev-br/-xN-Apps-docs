import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../model/category.entity";

export class SyncPayloadDaoCategory extends SyncPayloadDao<Category> {
    @ApiProperty({ type: Category })
    override data?: Category;
}
