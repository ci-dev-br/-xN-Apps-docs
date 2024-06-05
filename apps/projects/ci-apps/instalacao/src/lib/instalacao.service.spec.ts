import { TestBed } from '@angular/core/testing';

import { InstalacaoService } from './instalacao.service';

describe('InstalacaoService', () => {
  let service: InstalacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstalacaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
