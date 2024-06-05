import { TestBed } from '@angular/core/testing';

import { ImersaoService } from './imersao.service';

describe('ImersaoService', () => {
  let service: ImersaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImersaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
