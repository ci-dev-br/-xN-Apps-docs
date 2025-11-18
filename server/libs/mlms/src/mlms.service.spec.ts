import { Test, TestingModule } from '@nestjs/testing';
import { MlmsService } from './mlms.service';

describe('MlmsService', () => {
  let service: MlmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MlmsService],
    }).compile();

    service = module.get<MlmsService>(MlmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
