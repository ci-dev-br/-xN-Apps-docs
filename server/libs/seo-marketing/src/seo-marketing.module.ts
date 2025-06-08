import { Module } from '@nestjs/common';
import { SeoMarketingService } from './seo-marketing.service';
import { SeoKeyWord } from './models/seo-key-word.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@ci/core/core.module';
import { SeoPage } from './models/seo-page.entity';
import { SeoBackLink } from './models/seo-back-link.entity';
import { SeoCampanha } from './models/seo-campanha.entity';
import { SearchService } from './services/search.service';
export const SeoMarketingEntities = [
  SeoKeyWord,
  SeoPage,
  SeoBackLink,
  SeoCampanha,
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
  SeoKeyWord as KeyWord,
  SeoPage as Page,
  SeoBackLink as BackLink,
  SeoCampanha as Campanha,
  SearchService,
}