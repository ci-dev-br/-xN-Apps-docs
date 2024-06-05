import { TestBed } from '@angular/core/testing';

import { DevToolsService } from './dev-tools.service';

describe('DevToolsService', () => {
  let service: DevToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
