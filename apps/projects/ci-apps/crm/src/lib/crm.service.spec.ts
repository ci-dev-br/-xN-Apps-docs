import { TestBed } from '@angular/core/testing';

import { CrmService } from './crm.service';

describe('CrmService', () => {
  let service: CrmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
