import { Module } from '@nestjs/common';
import { SeoMarketingService } from './seo-marketing.service';
import { KeyWord } from './models/key-word.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@ci/core/core.module';
import { Page } from './models/page.entity';
import { BackLink } from './models/back-link.entity';
import { Campanha } from './models/campanha.entity';
import { SearchService } from './services/search.service';
export const SeoMarketingEntities = [
  KeyWord,
  Page,
  BackLink,
  Campanha,
];
@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([
      ...SeoMarketingEntities
    ])
  ],
  providers: [
    SeoMarketingService,
    SearchService,
  ],
  exports: [SeoMarketingService],
})
export class SeoMarketingModule { }
export {
  SeoMarketingService,
  KeyWord,
  Page,
  BackLink,
  Campanha,
  SearchService,
}