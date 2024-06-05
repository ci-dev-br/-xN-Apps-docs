import { TestBed } from '@angular/core/testing';

import { DataGridService } from './data-grid.service';

describe('DataGridService', () => {
  let service: DataGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
