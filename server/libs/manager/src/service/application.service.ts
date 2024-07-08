import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { ArrayContains, Repository } from "typeorm";
@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(Application)
        private readonly repo: Repository<Application>,
    ) { }
    async find(roles?: string[]) {
        return this.repo.find({
            order: { name: 'ASC' },
            where: [
                ...(roles ? roles.map(r => {
                    return {
                        roles: ArrayContains([r])
                    }
                }) : [])
            ]
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