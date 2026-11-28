import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { StorageMediaService } from "@ci/storage";
import { Equal, IsNull, Repository } from "typeorm";
import { Aula, MaterialApoioItem } from "../models/aula.entity";
import { CursoService } from "./curso.service";
import {
    AnexarMaterialAulaInputDto,
    AnexarVideoAulaInputDto,
    RemoverMaterialAulaInputDto,
} from "../dto/treinamento.dto";

@Injectable()
export class AulaService extends DaoFullAuditedServiceBase<Aula> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Aula)
        private readonly aulaRepo: Repository<Aula>,
        private readonly storageMedia: StorageMediaService,
        private readonly cursoService: CursoService,
    ) {
        super(snap, aulaRepo);
    }

    override async sincronizar(data: Aula, request?: any): Promise<Aula> {
        if (data?.cursoId && !data?.curso) {
            data.curso = { internalId: data.cursoId } as any;
        }
        if (data?.curso?.internalId && !data?.cursoId) {
            data.cursoId = data.curso.internalId;
        }
        if (!data?.internalId && data?.cursoId && (data.ordem === undefined || data.ordem === null)) {
            const count = await this.aulaRepo.count({
                where: { cursoId: Equal(data.cursoId), deleted: IsNull() },
            });
            data.ordem = count + 1;
        }
        return await super.sincronizar(data, request);
    }

    async anexarVideo(input: AnexarVideoAulaInputDto, request?: any): Promise<Aula> {
        const aula = await this.aulaRepo.findOne({
            where: { internalId: Equal(input.aulaId), deleted: IsNull() },
        });
        if (!aula) {
            throw new NotFoundException('Aula não encontrada.');
        }

        const asset = await this.storageMedia.getAssetInfo(input.assetId, request);
        aula.videoAssetId = asset.internalId;
        aula.videoFileName = asset.fileName || asset.originalFileName;
        aula.duracaoSegundos = asset.durationSeconds || 0;
        aula.duracaoLabel = asset.durationLabel || '00:00';
        aula.thumbnailDataUrl = asset.posterDataUrl;
        aula.videoMetadata = {
            width: asset.width,
            height: asset.height,
            videoCodec: asset.videoCodec,
            audioCodec: asset.audioCodec,
            sizeBytes: asset.sizeBytes,
            transcoded: asset.transcoded,
            mimeType: asset.mimeType,
        };

        const saved = await this.aulaRepo.save(aula);
        if (saved.cursoId) {
            await this.cursoService.recalcularCargaHoraria(saved.cursoId);
        }
        return saved;
    }

    async anexarMaterial(input: AnexarMaterialAulaInputDto, request?: any): Promise<Aula> {
        const aula = await this.aulaRepo.findOne({
            where: { internalId: Equal(input.aulaId), deleted: IsNull() },
        });
        if (!aula) {
            throw new NotFoundException('Aula não encontrada.');
        }

        const asset = await this.storageMedia.getAssetInfo(input.assetId, request);
        const currentList: MaterialApoioItem[] = Array.isArray(aula.materiaisApoio) ? [...aula.materiaisApoio] : [];
        const withoutDuplicate = currentList.filter(m => m.assetId !== asset.internalId);
        withoutDuplicate.push({
            assetId: asset.internalId,
            nome: asset.originalFileName || asset.fileName || 'material',
            mimeType: asset.mimeType,
            sizeBytes: Number(asset.sizeBytes || 0),
            descricao: input.descricao || undefined,
            adicionadoEm: new Date().toISOString(),
        });

        aula.materiaisApoio = withoutDuplicate;
        return await this.aulaRepo.save(aula);
    }

    async removerMaterial(input: RemoverMaterialAulaInputDto): Promise<Aula> {
        const aula = await this.aulaRepo.findOne({
            where: { internalId: Equal(input.aulaId), deleted: IsNull() },
        });
        if (!aula) {
            throw new NotFoundException('Aula não encontrada.');
        }
        const currentList: MaterialApoioItem[] = Array.isArray(aula.materiaisApoio) ? aula.materiaisApoio : [];
        aula.materiaisApoio = currentList.filter(m => m.assetId !== input.assetId);
        return await this.aulaRepo.save(aula);
    }
}
