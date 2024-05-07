import { Injectable } from "@nestjs/common";
import { DaoServiceBase, SnapshotService } from "src/core/dao";
import { Product } from "../models/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
@Injectable()
export class ProductService extends DaoServiceBase<Product> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Product)
        repository: Repository<Product>
    ) {
        super(snap, repository);
    }
}