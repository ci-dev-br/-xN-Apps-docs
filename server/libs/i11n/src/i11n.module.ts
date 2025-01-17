import { Module } from '@nestjs/common';
import { I11nService } from './i11n.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyCode } from '@ci/g11n';

export const I11nEntities = [
  CurrencyCode,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...I11nEntities,
    ])
  ],
  providers: [I11nService],
  exports: [I11nService],
})
export class I11nModule {}