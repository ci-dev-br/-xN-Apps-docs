import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { Repository } from "typeorm";

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(Application)
        private readonly repo: Repository<Application>,
    ) { }

    async find() {
        return this.repo.find({
            where: {}
        })
    }

    async sync(application: Application) {
        let { id, ...changes } = application;
        let ref = !!application.id ? await this.repo.findOneBy({ id: application.id }) : await this.repo.create(application);
        Object.assign(ref, changes);
        return await this.repo.save(ref);
    }


    async delete(applicationId: string) {
        return this.repo.delete(applicationId)
    }
}