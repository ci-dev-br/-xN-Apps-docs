import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@ci/core/core.module';
import { UsersModule } from '@ci/user/users.module';
import { User } from '@ci/auth/models/user.entity';
import { NotificacaoModule } from '@ci/notification';
import { SeoMarketingService } from './seo-marketing.service';
import { SeoKeyWord } from './models/seo-key-word.entity';
import { SeoPage } from './models/seo-page.entity';
import { SeoBackLink } from './models/seo-back-link.entity';
import { SeoCampanha } from './models/seo-campanha.entity';
import { SeoDomain } from './models/seo-domain.entity';
import { SeoTarefa } from './models/seo-tarefa.entity';
import { Category } from './models/category.entity';
import { News } from './models/news.entity';
import { Source } from './models/source.entity';
import { CategoryEvent } from './models/category-event.entity';
import { NewsVote } from './models/news-vote.entity';
import { NewsComment } from './models/news-comment.entity';
import { SearchService } from './services/search.service';
import { ScraperService } from './services/scraper.service';
import { DiscoveryService } from './services/discovery.service';
import { SeoAuditService } from './services/seo-audit.service';
import { NewsReaderDigestService } from './services/news-reader-digest.service';
import { SeoDomainService } from './services/seo-domain.service';
import { SeoPageService } from './services/seo-page.service';
import { SeoKeyWordService } from './services/seo-key-word.service';
import { SeoBackLinkService } from './services/seo-back-link.service';
import { SeoCampanhaService } from './services/seo-campanha.service';
import { SeoTarefaService } from './services/seo-tarefa.service';
import { NewsController } from './controller/news.controller';
import { SEOController } from './controller/seo.controller';
import { SeoDomainController } from './controller/seo-domain.controller';
import { SeoPageController } from './controller/seo-page.controller';
import { SeoKeyWordController } from './controller/seo-key-word.controller';
import { SeoBackLinkController } from './controller/seo-back-link.controller';
import { SeoCampanhaController } from './controller/seo-campanha.controller';
import { SeoTarefaController } from './controller/seo-tarefa.controller';
import {
  ReaderNewsClusterDto,
  ReaderNewsDigestDto,
  ReaderNewsDigestItemDto,
} from './dto/reader-digest.dto';

export const SeoEntities = [
  SeoDomain,
  SeoPage,
  SeoKeyWord,
  SeoBackLink,
  SeoCampanha,
  SeoTarefa,
];

export const SeoMarketingEntities = [
  ...SeoEntities,
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
    NotificacaoModule,
    TypeOrmModule.forFeature([
      ...SeoMarketingEntities,
      User,
    ]),
  ],
  providers: [
    SeoMarketingService,
    SeoDomainService,
    SeoPageService,
    SeoKeyWordService,
    SeoBackLinkService,
    SeoCampanhaService,
    SeoTarefaService,
    SearchService,
    ScraperService,
    DiscoveryService,
    SeoAuditService,
    NewsReaderDigestService,
    {
      provide: 'CLIENT.MODEL.EDITABLES',
      useValue: [
        ...(SeoEntities.map(e => e.name)),
      ],
    },
  ],
  controllers: [
    NewsController,
    SEOController,
    SeoDomainController,
    SeoPageController,
    SeoKeyWordController,
    SeoBackLinkController,
    SeoCampanhaController,
    SeoTarefaController,
  ],
  exports: [
    SeoMarketingService,
    SeoDomainService,
    SeoPageService,
    SeoKeyWordService,
    SeoBackLinkService,
    SeoCampanhaService,
    SeoTarefaService,
    NewsReaderDigestService,
  ],
})
export class SeoMarketingModule { }

export {
  SeoMarketingService,
  SeoDomainService,
  SeoPageService,
  SeoKeyWordService,
  SeoBackLinkService,
  SeoCampanhaService,
  SeoTarefaService,
  NewsReaderDigestService,
  ReaderNewsDigestDto,
  ReaderNewsClusterDto,
  ReaderNewsDigestItemDto,
  SeoDomain,
  SeoPage,
  SeoKeyWord,
  SeoBackLink,
  SeoCampanha,
  SeoTarefa,
  SeoKeyWord as KeyWord,
  SeoPage as Page,
  SeoBackLink as BackLink,
  SeoCampanha as Campanha,
  SearchService,
};
export * from './dto/dashboard-seo.dto';
export * from './models/seo-tarefa.entity';
