import { TestBed } from '@angular/core/testing';

import { OrganizacaoService } from './organizacao.service';

describe('OrganizacaoService', () => {
  let service: OrganizacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizacaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
