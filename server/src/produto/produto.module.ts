import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./models/product.entity";
import { Offer } from "./models/offer.entity";
import { TenantModule } from "src/tenant/tenant.module";
import { INPIModule } from "src/inpi/inpi.module";
import { ProductController } from "./controller/product.controller";
import { ProductService } from "./service/product.service";
import { CoreModule } from "@ci/core/core.module";

export const ProductEntities = [
    Product,
    Offer,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...ProductEntities,
        ]),
        TenantModule,
        INPIModule,
        CoreModule,
    ],
    providers: [
        ProductService,
    ],
    controllers: [
        ProductController,
    ],
})
export class ProdutoModule { }