import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Domain } from '../model/domain.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DomainService {
    constructor(
        @InjectRepository(Domain)
        private readonly repo: Repository<Domain>,
    ) { }
    async find(roles?: string[]) {
        return this.repo.find({
            order: { hostname: 'ASC' },
            // where: [
            // ...(roles ? roles.map(r => {
            //     return {
            //         roles: ArrayContains([r])
            //     }
            // }) : [])
            // ]
        })
    }
    async sync(domain: Domain) {
        let { id, ...changes } = domain;
        let ref = !!domain.id ?
            await this.repo.findOneBy({ id: domain.id }) :
            await this.repo.create(domain);
        Object.assign(ref, changes);
        return await this.repo.save(ref);
    }
    async delete(applicationId: string) {
        return this.repo.delete(applicationId)
    }
}