import { Injectable } from "@nestjs/common";
import { Prancheta } from "../models/prancheta.entity";
import { Equal, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class PranchetaService {
    constructor(
        @InjectRepository(Prancheta)
        private readonly prancheta_reppository: Repository<Prancheta>,
    ) { }
    async sincronize(prancheta_untastemented: Prancheta, options: {
        tenant?: string,
        req?: any,
    }) {
        // if (!(prancheta_untastemented instanceof Prancheta)) throw new Error("Bloqueio por elevação de contexto.");
        if (prancheta_untastemented.internalId) {
            let prancheta_current = await this.prancheta_reppository.findOne({ where: { internalId: prancheta_untastemented.internalId } });
            try {
                Object.keys(prancheta_untastemented).forEach((p, i) => {
                    if (i > 1000) return;
                    if (prancheta_untastemented[p] !== undefined)
                        prancheta_current[p] = prancheta_untastemented[p];
                });
            } catch (error) { }
            return await this.prancheta_reppository.save(prancheta_current);
        } else {
            if (!!options?.req) console.log(options.req.user);
            let prancheta_current = await this.prancheta_reppository.create({
                ...prancheta_untastemented,
                createdBy: { id: options.req.chaveAcesso },
                tenants: options.tenant ? [{ id: options.tenant }] : undefined
            })
            return await this.prancheta_reppository.save(prancheta_current);
        }
    }
    async Get(
        options: {
            userId?: string,
            tenant?: string,
        }
    ) {
        return await this.prancheta_reppository.find({
            where:
            {
                createdBy: {
                    identifiedUser: Equal(options.userId)
                }
            },
        });
    }
}