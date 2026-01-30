import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Category } from "../model/category.entity";

export class CategoryService extends DaoFullAuditedServiceBase<Category> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Category)
        repository: Repository<Category>
    ) {
        super(snap, repository);
    }

    /* constructor(
        snap: SnapshotService,
        @InjectRepository(Category)
        repository: Repository<Category>,
        dataSource?: DataSource,
    ) {
        super(snap, repository, dataSource);
    }
    override async getById(id: string, request?: any): Promise<Category> {
        return await this._repo.findOne({
            where: {
                // internationalCode: id
            }
        })
    } */
}