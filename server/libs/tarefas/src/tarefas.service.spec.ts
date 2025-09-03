import { Test, TestingModule } from '@nestjs/testing';
import { TarefasService } from './tarefas.service';

describe('TarefasService', () => {
  let service: TarefasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarefasService],
    }).compile();

    service = module.get<TarefasService>(TarefasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
