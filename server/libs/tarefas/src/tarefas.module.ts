import { Module } from '@nestjs/common';
import { TarefasService } from './tarefas.service';

@Module({
  providers: [TarefasService],
  exports: [TarefasService],
})
export class TarefasModule {}
