import { Module } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { Projeto } from './models/projeto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItem } from './models/work-item.entity';
import { Cliente } from './models/cliente.entity';
import { CasdastroModule } from '@ci/cadastro';
import { ProjetoService } from './service/projeto.service';
import { ProjetoController } from './controller/projeto.controller';
export const ProjetosEntities = [
  Projeto,
  WorkItem,
  Cliente,
]
/**
 * Gerenciamento de Projetos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...ProjetosEntities,
    ]),
    CasdastroModule,
  ],
  providers: [
    ProjetosService,
    ProjetoService,
  ],
  exports: [
    ProjetosService,
  ],
  controllers: [
    ProjetoController,
  ]
})
export class ProjetosModule { }
