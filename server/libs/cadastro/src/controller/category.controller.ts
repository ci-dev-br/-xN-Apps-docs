import { Body, Controller, Post, Req } from "@nestjs/common";
import { CategoryService } from "../service/category.service";
import { ControllerDaoBase } from "@ci/core";
import { Category } from "../model/category.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoCategory } from "../dto/sync-payload-dao-category";
import { ObterListaCategory } from "../dto/obter-list-category";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
/**
 * Category Controller
 */
@ApiTags('Category')
@Controller('Category')
export class CategoryController extends ControllerDaoBase<CategoryService, Category> {
    constructor(
        service: CategoryService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoCategory
    })
    @ApiOperation({
        operationId: 'Cynccategory'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoCategory,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req)
    }
    @Post('GetByInternalId')
    @ApiResponse({
        type: Category,
    })
    @ApiOperation({
        operationId: 'CetByInternalIdcategory',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req,
    ) {
        return await super.GetByInternalId(input, req);
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoCategory
    })
    @ApiOperation({
        operationId: 'CetListcategory'
    })
    override async GetList(
        @Body() input: ObterListaCategory,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
}