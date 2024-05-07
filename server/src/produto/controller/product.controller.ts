import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, SyncPayloadDao } from "src/core/dao";
import { Product } from "../models/product.entity";
import { ProductService } from "../service/product.service";

export class SyncPayloadDaoProduct extends SyncPayloadDao<Product> {
    @ApiProperty({ type: Product })
    override data?: Product;
}
export class ProductCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Product')
@Controller('Product')
export class ProductController extends ControllerDaoBase<ProductService, Product> {
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoProduct
    })
    @ApiOperation({
        operationId: 'ProductSync'
    })
    override async sync(
        @Body() body: SyncPayloadDaoProduct,
    ) {
        return await super.sync(body)
    }

    @Post('Get')
    @ApiResponse({
        type:
            SyncPayloadDaoProduct
    })
    @ApiOperation({
        operationId: 'ProductGet'
    })
    override async get(
        //@Body() input: ProductCotrollerGetInputDto,
    ) {
        // return await super.get(input)
    }
}