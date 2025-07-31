import { Body, Controller, Post } from "@nestjs/common";
import { WorkItemService } from "../service/work-item.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { WorkItem } from "../models/work-item.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoWorkItem extends SyncPayloadDao<WorkItem> {
    @ApiProperty({ type: WorkItem })
    override data?: WorkItem;
}
export class ObterListaWorkItem {
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<WorkItem>[] | FindOptionsWhere<WorkItem>;
}
export class WorkItemCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * WorkItem Controller
 */
@ApiTags('WorkItem')
@Controller('WorkItem')
export class WorkItemController extends ControllerDaoBase<WorkItemService, WorkItem> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoWorkItem
    })
    @ApiOperation({
        operationId: 'SyncWorkItem'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoWorkItem,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoWorkItem
    })
    @ApiOperation({
        operationId: 'GetListWorkItem'
    })
    override async GetList(
        @Body() input: ObterListaWorkItem,
    ) {
        return super.GetList(input);
    }
}