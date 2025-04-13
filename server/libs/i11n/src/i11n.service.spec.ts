import { Test, TestingModule } from '@nestjs/testing';
import { I11nService } from './i11n.service';
describe('I11nService', () => {
  let service: I11nService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [I11nService],
    }).compile();
    service = module.get<I11nService>(I11nService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
