import { TestBed } from '@angular/core/testing';

import { TreinamentoService } from './treinamento.service';

describe('TreinamentoService', () => {
  let service: TreinamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreinamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
