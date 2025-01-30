import { Module } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { Projeto } from './models/projeto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItem } from './models/work-item.entity';
export const ProjetosEntities = [
  Projeto,
  WorkItem,
]
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...ProjetosEntities,
    ])
  ],
  providers: [
    ProjetosService,
  ],
  exports: [
    ProjetosService,
  ],
})
export class ProjetosModule { }
