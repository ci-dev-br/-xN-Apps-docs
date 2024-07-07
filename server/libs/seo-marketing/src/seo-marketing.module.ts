import { Module } from '@nestjs/common';
import { SeoMarketingService } from './seo-marketing.service';
import { KeyWord } from './models/key-word';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@ci/core/core.module';
export const SeoMarketingEntities = [KeyWord,]
@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([
      ...SeoMarketingEntities
    ])
  ],
  providers: [
    SeoMarketingService],
  exports: [SeoMarketingService],
})
export class SeoMarketingModule { }
export {
  SeoMarketingService
}