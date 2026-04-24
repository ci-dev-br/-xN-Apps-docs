import { Module } from '@nestjs/common';
import { DyMService } from './dym.service';
import { DyMArtifact } from './models/dym-artifact.entity';
import { DyMBuildEnvironment } from './models/dym-build-environment.entity';
import { DyMBuildJob } from './models/dym-build-job.entity';
import { DyMSourceDefinition } from './models/dym-source-definition';
import { ManagerModule } from '@ci/manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DyMJobStatus } from './models/dym-job-status';
import { DeployerController } from './controllers/deployer.controller';
export const DyMEntities = [
  DyMArtifact,
  DyMBuildEnvironment,
  DyMBuildJob,
  DyMSourceDefinition,
];
@Module({
  imports: [
    ManagerModule,
    TypeOrmModule.forFeature(DyMEntities),
  ],
  providers: [
    DyMService,
  ],
  controllers: [
    DeployerController,
  ],
  exports: [
    DyMService
  ],
})
export class DyMModule { }
export {
  DyMArtifact,
  DyMBuildEnvironment,
  DyMBuildJob,
  DyMSourceDefinition,
  DyMJobStatus,
  DyMService as MlmsService,
}