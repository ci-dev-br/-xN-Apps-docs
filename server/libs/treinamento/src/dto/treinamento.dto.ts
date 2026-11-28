import { ApiProperty } from "@nestjs/swagger";
import { SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { Instrutor } from "../models/instrutor.entity";
import { Curso } from "../models/curso.entity";
import { Aula } from "../models/aula.entity";
import { Turma } from "../models/turma.entity";
import { Matricula } from "../models/matricula.entity";
import { AnotacaoEstudo } from "../models/anotacao-estudo.entity";

export class SyncPayloadDaoInstrutor extends SyncPayloadDao<Instrutor> {
    @ApiProperty({ type: Instrutor })
    override data?: Instrutor;
}
export class ObterListaInstrutor {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<Instrutor>[] | FindOptionsWhere<Instrutor>;
    @ApiProperty({ required: false }) search?: string;
}

export class SyncPayloadDaoCurso extends SyncPayloadDao<Curso> {
    @ApiProperty({ type: Curso })
    override data?: Curso;
}
export class ObterListaCurso {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<Curso>[] | FindOptionsWhere<Curso>;
    @ApiProperty({ required: false }) search?: string;
}

export class SyncPayloadDaoAula extends SyncPayloadDao<Aula> {
    @ApiProperty({ type: Aula })
    override data?: Aula;
}
export class ObterListaAula {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<Aula>[] | FindOptionsWhere<Aula>;
    @ApiProperty({ required: false }) search?: string;
}

export class SyncPayloadDaoTurma extends SyncPayloadDao<Turma> {
    @ApiProperty({ type: Turma })
    override data?: Turma;
}
export class ObterListaTurma {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<Turma>[] | FindOptionsWhere<Turma>;
    @ApiProperty({ required: false }) search?: string;
}

export class SyncPayloadDaoMatricula extends SyncPayloadDao<Matricula> {
    @ApiProperty({ type: Matricula })
    override data?: Matricula;
}
export class ObterListaMatricula {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<Matricula>[] | FindOptionsWhere<Matricula>;
    @ApiProperty({ required: false }) search?: string;
}

export class SyncPayloadDaoAnotacaoEstudo extends SyncPayloadDao<AnotacaoEstudo> {
    @ApiProperty({ type: AnotacaoEstudo })
    override data?: AnotacaoEstudo;
}
export class ObterListaAnotacaoEstudo {
    @ApiProperty({ required: false }) skip?: number;
    @ApiProperty({ required: false }) take?: number;
    @ApiProperty({ required: false }) where?: FindOptionsWhere<AnotacaoEstudo>[] | FindOptionsWhere<AnotacaoEstudo>;
    @ApiProperty({ required: false }) search?: string;
}

export class AnexarVideoAulaInputDto {
    @ApiProperty({ required: true })
    aulaId: string;

    @ApiProperty({ required: true })
    assetId: string;
}

export class AnexarMaterialAulaInputDto {
    @ApiProperty({ required: true })
    aulaId: string;

    @ApiProperty({ required: true })
    assetId: string;

    @ApiProperty({ required: false, nullable: true })
    descricao?: string;
}

export class RemoverMaterialAulaInputDto {
    @ApiProperty({ required: true })
    aulaId: string;

    @ApiProperty({ required: true })
    assetId: string;
}

export class MatricularCursoInputDto {
    @ApiProperty({ required: true })
    cursoId: string;

    @ApiProperty({ required: false, nullable: true })
    turmaId?: string;
}

export class RegistrarProgressoInputDto {
    @ApiProperty({ required: true })
    cursoId: string;

    @ApiProperty({ required: true })
    aulaId: string;

    @ApiProperty({ required: false, nullable: true })
    concluida?: boolean;

    @ApiProperty({ required: false, nullable: true })
    ultimoTempoSegundos?: number;
}

export class GetCatalogoCursoInputDto {
    @ApiProperty({ required: false, nullable: true })
    trilha?: string;

    @ApiProperty({ required: false, nullable: true })
    search?: string;

    @ApiProperty({ required: false, nullable: true })
    apenasMeusCursosInstrutor?: boolean;

    @ApiProperty({ required: false, nullable: true })
    apenasMatriculados?: boolean;
}

export class GetCatalogoCursoOutputDto {
    @ApiProperty({ type: Curso, isArray: true })
    cursos: Curso[];

    @ApiProperty({ type: Matricula, isArray: true })
    matriculas: Matricula[];
}
