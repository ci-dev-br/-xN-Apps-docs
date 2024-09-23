import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './model/form.entity';
export const FORMS_ENTITIES = [
  Form,
];
@Module({
  imports: [
    TypeOrmModule.forFeature(FORMS_ENTITIES)
  ],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule { }
