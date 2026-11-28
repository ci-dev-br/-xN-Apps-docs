import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Equal, IsNull, Repository } from "typeorm";
import { Curso } from "../models/curso.entity";
import { Aula } from "../models/aula.entity";
import { Turma } from "../models/turma.entity";
import { Matricula } from "../models/matricula.entity";
import { InstrutorService } from "./instrutor.service";
import { GetCatalogoCursoInputDto, GetCatalogoCursoOutputDto } from "../dto/treinamento.dto";

@Injectable()
export class CursoService extends DaoFullAuditedServiceBase<Curso> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Curso)
        private readonly cursoRepo: Repository<Curso>,
        @InjectRepository(Aula)
        private readonly aulaRepo: Repository<Aula>,
        @InjectRepository(Turma)
        private readonly turmaRepo: Repository<Turma>,
        @InjectRepository(Matricula)
        private readonly matriculaRepo: Repository<Matricula>,
        private readonly instrutorService: InstrutorService,
    ) {
        super(snap, cursoRepo);
    }

    override async sincronizar(data: Curso, request?: any): Promise<Curso> {
        const user = request?.user;
        if (!data?.internalId && user?.id && !data.instrutorUserId) {
            data.instrutorUserId = user.id;
        }
        if (!data?.instrutor && user?.id) {
            const perfil = await this.instrutorService.obterOuCriarMeuPerfil(request);
            data.instrutor = { internalId: perfil.internalId } as any;
            if (!data.instrutorNome) {
                data.instrutorNome = perfil.nome;
            }
        }
        if (!data?.instrutorNome && user) {
            data.instrutorNome = user.fullName || user.surname || user.username || 'Instrutor';
        }
        const saved = await super.sincronizar(data, request);
        return await this.carregarCursoCompleto(saved.internalId!);
    }

    async carregarCursoCompleto(cursoId: string): Promise<Curso> {
        const curso = await this.cursoRepo.findOne({
            where: { internalId: Equal(cursoId), deleted: IsNull() },
            relations: { instrutor: true },
        });
        if (!curso) {
            throw new NotFoundException('Treinamento não encontrado.');
        }
        const aulas = await this.aulaRepo.find({
            where: { cursoId: Equal(cursoId), deleted: IsNull() },
            order: { ordem: 'ASC', createdAt: 'ASC' },
        });
        const turmas = await this.turmaRepo.find({
            where: { cursoId: Equal(cursoId), deleted: IsNull() },
            order: { dataInicio: 'ASC', createdAt: 'ASC' },
        });
        curso.aulas = aulas;
        curso.turmas = turmas;
        return curso;
    }

    async getCatalogo(input: GetCatalogoCursoInputDto, request?: any): Promise<GetCatalogoCursoOutputDto> {
        const userId = request?.user?.id;
        const allCursos = await this.cursoRepo.find({
            where: { deleted: IsNull() },
            relations: { instrutor: true },
            order: { createdAt: 'DESC' },
        });

        const allAulas = await this.aulaRepo.find({
            where: { deleted: IsNull() },
            order: { ordem: 'ASC', createdAt: 'ASC' },
        });
        const allTurmas = await this.turmaRepo.find({
            where: { deleted: IsNull() },
            order: { dataInicio: 'ASC', createdAt: 'ASC' },
        });

        const aulasByCurso = new Map<string, Aula[]>();
        for (const a of allAulas) {
            const cId = a.cursoId;
            if (!cId) continue;
            if (!aulasByCurso.has(cId)) aulasByCurso.set(cId, []);
            aulasByCurso.get(cId)!.push(a);
        }
        const turmasByCurso = new Map<string, Turma[]>();
        for (const t of allTurmas) {
            const cId = t.cursoId;
            if (!cId) continue;
            if (!turmasByCurso.has(cId)) turmasByCurso.set(cId, []);
            turmasByCurso.get(cId)!.push(t);
        }

        const matriculas = userId
            ? await this.matriculaRepo.find({
                where: { userId: Equal(userId), deleted: IsNull() },
                order: { createdAt: 'DESC' },
            })
            : [];
        const enrolledCursoIds = new Set(matriculas.map(m => m.cursoId).filter(Boolean));

        const searchTerm = (input?.search || '').trim().toLowerCase();
        const trilhaFilter = (input?.trilha || '').trim();

        const filtered = allCursos
            .map(c => ({
                ...c,
                aulas: aulasByCurso.get(c.internalId!) || [],
                turmas: turmasByCurso.get(c.internalId!) || [],
            }))
            .filter(c => {
                if (input?.apenasMeusCursosInstrutor && userId) {
                    const isOwner = c.instrutorUserId === userId || c.instrutor?.userId === userId;
                    if (!isOwner) return false;
                } else {
                    const isOwner = Boolean(userId && (c.instrutorUserId === userId || c.instrutor?.userId === userId));
                    if (!c.publicado && !isOwner) return false;
                }
                if (input?.apenasMatriculados && !enrolledCursoIds.has(c.internalId!)) {
                    return false;
                }
                if (trilhaFilter && trilhaFilter !== 'Todos' && c.trilha !== trilhaFilter) {
                    return false;
                }
                if (searchTerm) {
                    const matchTitle = (c.titulo || '').toLowerCase().includes(searchTerm);
                    const matchInstr = (c.instrutorNome || c.instrutor?.nome || '').toLowerCase().includes(searchTerm);
                    const matchDesc = (c.descricao || '').toLowerCase().includes(searchTerm);
                    if (!matchTitle && !matchInstr && !matchDesc) return false;
                }
                return true;
            });

        return {
            cursos: filtered,
            matriculas,
        };
    }

    async recalcularCargaHoraria(cursoId: string): Promise<void> {
        const curso = await this.cursoRepo.findOne({ where: { internalId: Equal(cursoId), deleted: IsNull() } });
        if (!curso) return;
        const aulas = await this.aulaRepo.find({ where: { cursoId: Equal(cursoId), deleted: IsNull() } });
        const totalSeconds = aulas.reduce((sum, a) => sum + (Number(a.duracaoSegundos) || 0), 0);
        if (totalSeconds > 0) {
            curso.cargaHoraria = Math.max(1, Math.ceil(totalSeconds / 3600));
            await this.cursoRepo.save(curso);
        }
    }
}
