import { Module } from '@nestjs/common';
import { Projeto } from './models/projeto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItem } from './models/work-item.entity';
import { ClienteProjeto } from './models/cliente-projeto.entity';
import { CasdastroModule } from '@ci/cadastro';
import { ProjetoService } from './service/projeto.service';
import { ProjetoController } from './controller/projeto.controller';
import { CoreModule } from '@ci/core';
import { WorkItemService } from './service/work-item.service';
import { ClienteProjetoService } from './service/cliente-projeto.service';
import { ClienteProjetoController } from './controller/cliente-projeto.controller';
import { WorkItemController } from './controller/work-item.controller';
export const ProjetosEntities = [
  Projeto,
  WorkItem,
  ClienteProjeto,
]
/**
 * Gerenciamento de Projetos
 */
@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([
      ...ProjetosEntities,
    ]),
    CasdastroModule,

  ],
  providers: [
    ProjetoService,
    WorkItemService,
    ClienteProjetoService,
  ],
  exports: [
    ProjetoService,
    WorkItemService,
    ClienteProjetoService,
  ],
  controllers: [
    ProjetoController,
    ClienteProjetoController,
    WorkItemController,
  ]
})
export class ProjetosModule { }
