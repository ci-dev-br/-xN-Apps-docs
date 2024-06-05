import { TestBed } from '@angular/core/testing';

import { GerencialService } from './gerencial.service';

describe('GerencialService', () => {
  let service: GerencialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GerencialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
