import { Injectable } from "@nestjs/common";
import { Prancheta } from "../models/prancheta.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PranchetaService {
    constructor(
        @InjectRepository(Prancheta)
        private readonly prancheta_reppository: Repository<Prancheta>,
    ) { }
    async sincronize(prancheta_untastemented: Prancheta) {
        if (!(prancheta_untastemented instanceof Prancheta)) throw new Error("Bloqueio por elevação de contexto.");
        if (prancheta_untastemented.id) {
            let prancheta_current = await this.prancheta_reppository.findOne({ where: { id: prancheta_untastemented.id } });
            try {
                Object.keys(prancheta_untastemented).forEach((p, i) => {
                    if (i > 1000) return;
                    if (prancheta_untastemented[p] !== undefined)
                        prancheta_current[p] = prancheta_untastemented[p];
                });
            } catch (error) { }
            return await this.prancheta_reppository.save(prancheta_current);
        }
    }
}