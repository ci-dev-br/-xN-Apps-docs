import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVinculoSocial, VinculoSocial } from '../models/vinculo-social.entity';
import { User } from '@ci/auth/models/user.entity';

export interface SocialStatusDto {
    isFollowing: boolean;
    isFollower: boolean;
    isConhecido: boolean;
    tipo: 'SELF' | 'CONHECIDO' | 'SEGUINDO' | 'SEGUIDOR' | 'NENHUM';
}

@Injectable()
export class SocialService {
    constructor(
        @InjectRepository(VinculoSocial)
        private readonly vinculoRepo: Repository<VinculoSocial>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    /**
     * Segue outro usuário. Se houver reciprocidade (o outro usuário já segue o autor),
     * ambos passam a ser classificados como "CONHECIDO".
     */
    async seguir(seguidorId: string, seguidoId: string): Promise<VinculoSocial> {
        if (!seguidorId || !seguidoId) {
            throw new BadRequestException('Identificadores de usuários inválidos.');
        }

        if (seguidorId === seguidoId) {
            throw new BadRequestException('Um usuário não pode seguir a si mesmo.');
        }

        const [seguidor, seguido] = await Promise.all([
            this.userRepo.findOne({ where: { id: seguidorId } }),
            this.userRepo.findOne({ where: { id: seguidoId } }),
        ]);

        if (!seguidor || !seguido) {
            throw new NotFoundException('Usuário não encontrado para estabelecer vínculo.');
        }

        // Verifica se o outro usuário já segue o seguidor atual (relação reversa)
        const vinculoReverso = await this.vinculoRepo.findOne({
            where: {
                seguidor: { id: seguidoId },
                seguido: { id: seguidorId },
            },
        });

        const ehReciproco = !!vinculoReverso;
        const tipoFinal = ehReciproco ? TipoVinculoSocial.CONHECIDO : TipoVinculoSocial.SEGUIDOR;

        // Se a relação já for recíproca, atualiza o vínculo reverso para CONHECIDO
        if (ehReciproco && vinculoReverso.tipo !== TipoVinculoSocial.CONHECIDO) {
            vinculoReverso.tipo = TipoVinculoSocial.CONHECIDO;
            await this.vinculoRepo.save(vinculoReverso);
        }

        // Verifica se já existia o vínculo direto
        let vinculoDireto = await this.vinculoRepo.findOne({
            where: {
                seguidor: { id: seguidorId },
                seguido: { id: seguidoId },
            },
        });

        if (vinculoDireto) {
            vinculoDireto.tipo = tipoFinal;
            return await this.vinculoRepo.save(vinculoDireto);
        }

        vinculoDireto = this.vinculoRepo.create({
            seguidor,
            seguido,
            tipo: tipoFinal,
        });

        return await this.vinculoRepo.save(vinculoDireto);
    }

    /**
     * Deixa de seguir um usuário. Caso fossem conhecidos, a outra direção volta
     * a ter status de apenas "SEGUIDOR".
     */
    async deixarDeSeguir(seguidorId: string, seguidoId: string): Promise<{ success: boolean }> {
        const vinculoDireto = await this.vinculoRepo.findOne({
            where: {
                seguidor: { id: seguidorId },
                seguido: { id: seguidoId },
            },
        });

        if (vinculoDireto) {
            await this.vinculoRepo.remove(vinculoDireto);
        }

        // Se havia vínculo reverso (o outro usuário continua seguindo), volta para SEGUIDOR
        const vinculoReverso = await this.vinculoRepo.findOne({
            where: {
                seguidor: { id: seguidoId },
                seguido: { id: seguidorId },
            },
        });

        if (vinculoReverso && vinculoReverso.tipo === TipoVinculoSocial.CONHECIDO) {
            vinculoReverso.tipo = TipoVinculoSocial.SEGUIDOR;
            await this.vinculoRepo.save(vinculoReverso);
        }

        return { success: true };
    }

    /**
     * Consulta o status do vínculo social entre dois usuários.
     */
    async obterStatus(meuUserId?: string, outroUserId?: string): Promise<SocialStatusDto> {
        if (!outroUserId) {
            return { isFollowing: false, isFollower: false, isConhecido: false, tipo: 'NENHUM' };
        }

        if (meuUserId && meuUserId === outroUserId) {
            return { isFollowing: false, isFollower: false, isConhecido: false, tipo: 'SELF' };
        }

        if (!meuUserId) {
            return { isFollowing: false, isFollower: false, isConhecido: false, tipo: 'NENHUM' };
        }

        const [vinculoDireto, vinculoReverso] = await Promise.all([
            this.vinculoRepo.findOne({
                where: {
                    seguidor: { id: meuUserId },
                    seguido: { id: outroUserId },
                },
            }),
            this.vinculoRepo.findOne({
                where: {
                    seguidor: { id: outroUserId },
                    seguido: { id: meuUserId },
                },
            }),
        ]);

        const isFollowing = !!vinculoDireto;
        const isFollower = !!vinculoReverso;
        const isConhecido = isFollowing && isFollower;

        let tipo: 'SELF' | 'CONHECIDO' | 'SEGUINDO' | 'SEGUIDOR' | 'NENHUM' = 'NENHUM';
        if (isConhecido) {
            tipo = 'CONHECIDO';
        } else if (isFollowing) {
            tipo = 'SEGUINDO';
        } else if (isFollower) {
            tipo = 'SEGUIDOR';
        }

        return { isFollowing, isFollower, isConhecido, tipo };
    }

    /**
     * Retorna lista de conexões (seguidores, seguindo e conhecidos) de um usuário.
     */
    async obterConexoes(userId: string) {
        const [seguindo, seguidores] = await Promise.all([
            this.vinculoRepo.find({
                where: { seguidor: { id: userId } },
                relations: ['seguido'],
            }),
            this.vinculoRepo.find({
                where: { seguido: { id: userId } },
                relations: ['seguidor'],
            }),
        ]);

        const conhecidos = seguindo.filter(v => v.tipo === TipoVinculoSocial.CONHECIDO);

        return {
            totalSeguindo: seguindo.length,
            totalSeguidores: seguidores.length,
            totalConhecidos: conhecidos.length,
            seguindo: seguindo.map(v => v.seguido),
            seguidores: seguidores.map(v => v.seguidor),
            conhecidos: conhecidos.map(v => v.seguido),
        };
    }
}
