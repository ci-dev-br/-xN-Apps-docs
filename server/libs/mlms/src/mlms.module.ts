import { Module } from '@nestjs/common';
import { MlmsService } from './mlms.service';
import { Artifact } from './models/artifact.entity';
import { BuildEnvironment } from './models/build-environment.entity';
import { BuildJob } from './models/build-job.entity';
import { SourceDefinition } from './models/source-definition';
import { ManagerModule } from '@ci/manager';
import { TypeOrmModule } from '@nestjs/typeorm';
export const MlmsEntities = [
  Artifact,
  BuildEnvironment,
  BuildJob,
  SourceDefinition,
];
@Module({
  imports: [
    ManagerModule,
    TypeOrmModule.forFeature(MlmsEntities),
  ],
  providers: [
    MlmsService,
  ],
  controllers: [

  ],
  exports: [
    MlmsService
  ],
})
export class MlmsModule { }
