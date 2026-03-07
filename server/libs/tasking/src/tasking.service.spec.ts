import { Test, TestingModule } from '@nestjs/testing';
import { TaskingService } from './tasking.service';

describe('TaskingService', () => {
  let service: TaskingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskingService],
    }).compile();

    service = module.get<TaskingService>(TaskingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
