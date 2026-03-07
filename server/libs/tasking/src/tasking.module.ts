import { Module } from '@nestjs/common';
import { TaskingService } from './tasking.service';
import { ChangelogService } from './changelog.service';
import { ChangelogController } from './changelog.controller';
export const Entities = [
  /* TODO: adicionar entidades */
];
@Module({
  controllers: [
    ChangelogController,
  ],
  providers: [
    TaskingService,
    ChangelogService,
  ],
  exports: [
    TaskingService,
  ],
})
export class TaskingModule { }
