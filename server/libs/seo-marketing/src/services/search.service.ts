import { SnapshotService } from "@ci/manager";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SearchService /* extends DaoServiceBase<Page> */ {
    constructor(
        private readonly snap: SnapshotService,
        // @InjectRepository(Page)
        // repo: Repository<Page>
    ) {
        // super(snap, repo);
    }

    async findByText(text: string) {

    }
}