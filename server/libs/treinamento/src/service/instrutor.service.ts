import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Equal, IsNull, Repository } from "typeorm";
import { Instrutor } from "../models/instrutor.entity";

@Injectable()
export class InstrutorService extends DaoFullAuditedServiceBase<Instrutor> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Instrutor)
        private readonly instrutorRepo: Repository<Instrutor>,
    ) {
        super(snap, instrutorRepo);
    }

    async obterOuCriarMeuPerfil(request?: any): Promise<Instrutor> {
        const user = request?.user;
        const userId = user?.id;
        if (userId) {
            const existing = await this.instrutorRepo.findOne({
                where: { userId: Equal(userId), deleted: IsNull() },
            });
            if (existing) return existing;
        }

        const nome = user?.fullName || user?.surname || user?.username || 'Instrutor';
        const novo: Instrutor = {
            nome,
            email: user?.email || undefined,
            telefone: user?.phone || undefined,
            especialidade: 'Educação Corporativa & Tecnologia',
            biografia: 'Instrutor responsável pela criação e condução de treinamentos.',
            userId,
        } as Instrutor;

        return await this.sincronizar(novo, request);
    }
}
