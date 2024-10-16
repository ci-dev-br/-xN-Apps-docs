import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Domain } from '../model/domain.entity';
import { ILike, Repository } from 'typeorm';
// import { threadId } from 'worker_threads';

@Injectable()
export class DomainService implements OnModuleInit {
    private static _request = [];
    /// private static domainService = [];
    private static _whitelist = [];
    private static _service: DomainService;
    static get whitelist() {
        return DomainService._whitelist;
    }
    static async requestWhitelist(host: string) {
        try {
            // return DomainService._whitelist;
            if (!DomainService._request) DomainService._request = [];

            if (DomainService._request.indexOf(host) === -1)
                DomainService._request.push(host);
            if (!!DomainService._service) await this._service.requestDomains(DomainService._request)

            DomainService._whitelist = ((await this._service.repo.find({ where: { varified: true } })) || []).map(d => d.hostname)
        } catch (error) {
            console.error(error)
        }
    }
    constructor(
        @InjectRepository(Domain)
        private readonly repo: Repository<Domain>,
    ) { }
    async onModuleInit() {
        console.log('[Domain Service iniciado]');
        if (!DomainService._service) DomainService._service = this;
        if (DomainService._request) await this.requestDomains(DomainService._request);
        DomainService._whitelist = (await this.repo.find({ where: { varified: true } }) || []).map(d => d.hostname)
    }
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
    async requestDomains(hosts?: string | string[]) {
        try {
            let hosts_finded = await this.repo.find({
                where:
                    Array.isArray(hosts) ? hosts.map(h => { return { hostname: ILike(h) } }) : null
            });
            let finded = [];
            if (Array.isArray(hosts)) hosts.forEach(async host => {
                if (!host) return;
                let find = hosts_finded.find(h => h.hostname === host);
                if (!find) {
                    let host_to_create = await this.repo.create({ hostname: host });
                    try {
                        this.repo.save(host_to_create);
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    if (find && !!find.varified) {
                        finded.push(find);
                    }
                }
            })
            return finded;
        } catch (error) {
            console.error(error);
        }
        return [];
    }
    async sync(domain: Domain) {
        let { internalId, ...changes } = domain;
        let ref = !!domain.internalId ?
            await this.repo.findOneBy({ internalId: domain.internalId }) :
            await this.repo.create(domain);
        Object.assign(ref, changes);
        return await this.repo.save(ref);
    }
    async delete(applicationId: string) {
        return this.repo.delete(applicationId)
    }
}