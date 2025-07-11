import { Body, Controller, Post } from "@nestjs/common";
import { BillingTypeService } from "../service/billing-type.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { BillingType } from "../model/billing-type.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoBillingType extends SyncPayloadDao<BillingType> {
    @ApiProperty({ type: BillingType })
    override data?: BillingType;
}
export class ObterListaBillingType {
    // override data?: BillingType;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<BillingType>[] | FindOptionsWhere<BillingType>;
}
export class BillingTypeCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * BillingType Controller
 */
@ApiTags('BillingType')
@Controller('BillingType')
export class BillingTypeController extends ControllerDaoBase<BillingTypeService, BillingType> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoBillingType
    })
    @ApiOperation({
        operationId: 'SyncBillingType'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoBillingType,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoBillingType
    })
    @ApiOperation({
        operationId: 'GetListBillingType'
    })
    override async GetList(
        @Body() input: ObterListaBillingType,
    ) {
        return super.GetList(input);
    }
}