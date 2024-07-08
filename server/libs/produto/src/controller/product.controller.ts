import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Product } from "../models/product.entity";
import { ProductService } from "../service/product.service";

export class SyncPayloadDaoProduct extends SyncPayloadDao<Product> {
    @ApiProperty({ type: Product })
    override data?: Product;
}
export class ProductCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    where?: any;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
}
@ApiTags('Product')
@Controller('Product')
export class ProductController extends ControllerDaoBase<ProductService, Product> {
    constructor(service: ProductService) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoProduct
    })
    @ApiOperation({
        operationId: 'ProductSync'
    })
    override async sync(
        @Body() input: SyncPayloadDaoProduct,
        @Req() req?: any,
    ) {
        return await super.sync(input, req);
    }

    @Post('Get')
    @ApiResponse({
        type:
            Product,
        isArray: true
    })
    @ApiOperation({
        operationId: 'ProductGet',

    })
    override async get(
        @Body() input: ProductCotrollerGetInputDto,
        @Req() req,
    ) {
        return await super.get(input, req);
    }
}