import { TestBed } from '@angular/core/testing';

import { CoreService } from './core.service';
import { CoreModule } from './core.module';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
      ]
    });
    service = TestBed.inject(CoreService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });
});
