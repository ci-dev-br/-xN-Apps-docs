import { TestBed } from '@angular/core/testing';

import { LowCodeService } from './low-code.service';

describe('LowCodeService', () => {
  let service: LowCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LowCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
