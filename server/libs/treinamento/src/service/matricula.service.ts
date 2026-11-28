import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Equal, IsNull, Repository } from "typeorm";
import { Matricula } from "../models/matricula.entity";
import { Curso } from "../models/curso.entity";
import { Aula } from "../models/aula.entity";
import { MatricularCursoInputDto, RegistrarProgressoInputDto } from "../dto/treinamento.dto";

@Injectable()
export class MatriculaService extends DaoFullAuditedServiceBase<Matricula> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Matricula)
        private readonly matriculaRepo: Repository<Matricula>,
        @InjectRepository(Curso)
        private readonly cursoRepo: Repository<Curso>,
        @InjectRepository(Aula)
        private readonly aulaRepo: Repository<Aula>,
    ) {
        super(snap, matriculaRepo);
    }

    async matricular(input: MatricularCursoInputDto, request?: any): Promise<Matricula> {
        const user = request?.user;
        const userId = user?.id;
        if (!input?.cursoId) {
            throw new BadRequestException('Informe o cursoId para matrícula.');
        }

        const curso = await this.cursoRepo.findOne({
            where: { internalId: Equal(input.cursoId), deleted: IsNull() },
        });
        if (!curso) {
            throw new NotFoundException('Curso não encontrado.');
        }

        if (userId) {
            const existing = await this.matriculaRepo.findOne({
                where: { cursoId: Equal(input.cursoId), userId: Equal(userId), deleted: IsNull() },
            });
            if (existing) return existing;
        }

        const matricula: Matricula = {
            cursoId: curso.internalId,
            curso: { internalId: curso.internalId } as any,
            turma: input.turmaId ? ({ internalId: input.turmaId } as any) : undefined,
            userId,
            alunoNome: user?.fullName || user?.surname || user?.username || 'Colaborador Autorizado',
            alunoEmail: user?.email || undefined,
            status: 'Confirmada',
            presencaConfirmada: true,
            progresso: 0,
            aulasConcluidasIds: [],
            ultimoTempoPorAula: {},
        } as Matricula;

        return await this.sincronizar(matricula, request);
    }

    async registrarProgresso(input: RegistrarProgressoInputDto, request?: any): Promise<Matricula> {
        if (!input?.cursoId || !input?.aulaId) {
            throw new BadRequestException('Informe cursoId e aulaId.');
        }

        const matricula = await this.matricular({ cursoId: input.cursoId }, request);
        const aulas = await this.aulaRepo.find({
            where: { cursoId: Equal(input.cursoId), deleted: IsNull() },
        });

        const completedSet = new Set<string>(Array.isArray(matricula.aulasConcluidasIds) ? matricula.aulasConcluidasIds : []);
        if (input.concluida === true) {
            completedSet.add(input.aulaId);
        } else if (input.concluida === false) {
            completedSet.delete(input.aulaId);
        }

        const tempoMap: Record<string, number> = {
            ...(matricula.ultimoTempoPorAula || {}),
        };
        if (typeof input.ultimoTempoSegundos === 'number' && Number.isFinite(input.ultimoTempoSegundos)) {
            tempoMap[input.aulaId] = Math.max(0, Math.floor(input.ultimoTempoSegundos));
        }

        matricula.aulasConcluidasIds = Array.from(completedSet);
        matricula.ultimoTempoPorAula = tempoMap;
        matricula.ultimaAulaId = input.aulaId;

        const totalAulas = Math.max(1, aulas.length);
        const doneCount = aulas.filter(a => completedSet.has(a.internalId!)).length;
        matricula.progresso = Math.min(100, Math.round((doneCount / totalAulas) * 100));

        if (matricula.progresso === 100 && !matricula.certificadoCodigo) {
            const suffix = Math.floor(10000 + Math.random() * 90000);
            matricula.certificadoCodigo = `CI-TRN-${new Date().getFullYear()}-${suffix}`;
            matricula.certificadoEmitidoEm = new Date().toLocaleDateString('pt-BR');
        }

        return await this.matriculaRepo.save(matricula);
    }
}
