import { Module } from '@nestjs/common';
import { SeoMarketingService } from './seo-marketing.service';
import { SeoKeyWord } from './models/seo-key-word.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@ci/core/core.module';
import { SeoPage } from './models/seo-page.entity';
import { SeoBackLink } from './models/seo-back-link.entity';
import { SeoCampanha } from './models/seo-campanha.entity';
import { SearchService } from './services/search.service';
import { Category } from './models/category.entity';
import { News } from './models/news.entity';
import { ScraperService } from './services/scraper.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { Source } from './models/source.entity';
import { CategoryEvent } from './models/category-event.entity';
import { DiscoveryService } from './services/discovery.service';
import { NewsController } from './controller/news.controller';
import { NewsVote } from './models/news-vote.entity';
import { NewsComment } from './models/news-comment.entity';
import { UsersModule } from '@ci/user/users.module';

export const SeoMarketingEntities = [
  SeoKeyWord,
  SeoPage,
  SeoBackLink,
  SeoCampanha,
  Category,
  News,
  Source,
  CategoryEvent,
  NewsVote,
  NewsComment,
];
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    CoreModule,
    UsersModule,
    TypeOrmModule.forFeature([
      ...SeoMarketingEntities
    ]),
  ],
  providers: [
    SeoMarketingService,
    SearchService,
    ScraperService,
    DiscoveryService,
  ],
  controllers: [
    NewsController,
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