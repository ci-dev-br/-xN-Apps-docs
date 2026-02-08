import { Module } from '@nestjs/common';
import { VendasService } from './vendas.service';

@Module({
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}
