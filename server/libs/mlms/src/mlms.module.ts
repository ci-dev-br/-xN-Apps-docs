import { Module } from '@nestjs/common';
import { MlmsService } from './mlms.service';

export const MlmsEntities =[];
@Module({
  providers: [MlmsService],
  exports: [MlmsService],
})
export class MlmsModule {}
