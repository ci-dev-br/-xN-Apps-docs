import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Category } from "../model/category.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class CategoryService extends DaoServiceBase<Category> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Category)
        repository: Repository<Category>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Category> {
        return await this._repo.findOne({
            where: {
                // internationalCode: id
            }
        })
    }
}