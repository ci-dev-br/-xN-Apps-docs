import { Test, TestingModule } from '@nestjs/testing';
import { CadastroService } from './cadastro.service';

describe('CadastroService', () => {
  let service: CadastroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CadastroService],
    }).compile();

    service = module.get<CadastroService>(CadastroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
