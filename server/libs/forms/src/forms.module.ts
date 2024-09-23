import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './model/form.entity';
import { FormsService } from './service/forms.service';
import { FormsController } from './controller/forms.controller';
import { TenantModule } from '@ci/tenant';
import { CoreModule } from '@ci/core';
export const FORMS_ENTITIES = [
  Form,
];
@Module({
  imports: [
    TypeOrmModule.forFeature(FORMS_ENTITIES),
    TenantModule,
    CoreModule,
  ],
  providers: [
    FormsService,
  ],
  controllers: [
    FormsController,
  ],
  exports: [
    FormsService,
  ],
})
export class FormsModule { }
