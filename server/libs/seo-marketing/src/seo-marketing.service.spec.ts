import { Test, TestingModule } from '@nestjs/testing';
import { SeoMarketingService } from './seo-marketing.service';

describe('SeoMarketingService', () => {
  let service: SeoMarketingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeoMarketingService],
    }).compile();

    service = module.get<SeoMarketingService>(SeoMarketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
