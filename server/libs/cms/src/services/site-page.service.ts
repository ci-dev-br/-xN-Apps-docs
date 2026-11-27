import { Equal, IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SitePage } from "../models/site-page.entity";

export class SitePageService extends DaoFullAuditedServiceBase<SitePage> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SitePage)
        repository: Repository<SitePage>
    ) {
        super(snap, repository);
    }

    async getPage(domain: string, path: string) {
        return await this._repo.findOne({
            where: {
                urlMatch: Equal(path),
                deleted: IsNull(),
                website: {
                    domain: Equal(domain),
                }
            }
        });
    }
}
