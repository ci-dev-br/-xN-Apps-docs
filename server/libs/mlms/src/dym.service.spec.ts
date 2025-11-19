import { Test, TestingModule } from '@nestjs/testing';
import { DyMService as DyMService } from './dym.service';
describe('SyMService', () => {
  let service: DyMService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DyMService],
    }).compile();
    service = module.get<DyMService>(DyMService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
