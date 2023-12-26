import { TestBed } from '@angular/core/testing';

import { UxKitService } from './ux-kit.service';

describe('UxKitService', () => {
  let service: UxKitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UxKitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
