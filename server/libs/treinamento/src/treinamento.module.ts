import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core";
import { AuthModule } from "@ci/auth/auth.module";
import { StorageModule } from "@ci/storage";
import { Instrutor } from "./models/instrutor.entity";
import { Curso } from "./models/curso.entity";
import { Aula } from "./models/aula.entity";
import { Turma } from "./models/turma.entity";
import { Matricula } from "./models/matricula.entity";
import { AnotacaoEstudo } from "./models/anotacao-estudo.entity";
import { InstrutorService } from "./service/instrutor.service";
import { CursoService } from "./service/curso.service";
import { AulaService } from "./service/aula.service";
import { TurmaService } from "./service/turma.service";
import { MatriculaService } from "./service/matricula.service";
import { AnotacaoEstudoService } from "./service/anotacao-estudo.service";
import { InstrutorController } from "./controller/instrutor.controller";
import { CursoController } from "./controller/curso.controller";
import { AulaController } from "./controller/aula.controller";
import { TurmaController } from "./controller/turma.controller";
import { MatriculaController } from "./controller/matricula.controller";
import { AnotacaoEstudoController } from "./controller/anotacao-estudo.controller";

export const TreinamentoEntities = [
    Instrutor,
    Curso,
    Aula,
    Turma,
    Matricula,
    AnotacaoEstudo,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(TreinamentoEntities),
        CoreModule,
        forwardRef(() => AuthModule),
        forwardRef(() => StorageModule),
    ],
    controllers: [
        InstrutorController,
        CursoController,
        AulaController,
        TurmaController,
        MatriculaController,
        AnotacaoEstudoController,
    ],
    providers: [
        InstrutorService,
        CursoService,
        AulaService,
        TurmaService,
        MatriculaService,
        AnotacaoEstudoService,
        {
            provide: 'CLIENT.MODEL.EDITABLES',
            useValue: [
                ...(TreinamentoEntities.map(e => e.name)),
            ],
        },
    ],
    exports: [
        InstrutorService,
        CursoService,
        AulaService,
        TurmaService,
        MatriculaService,
        AnotacaoEstudoService,
    ],
})
export class TreinamentoModule { }
