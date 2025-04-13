import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmEntities } from './models';
/**
 * Módulo de CRM
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...CrmEntities,
    ])
  ],
  providers: [
    CrmService,
  ],
  exports: [
    CrmService,
  ],
})
export class CrmModule { }
