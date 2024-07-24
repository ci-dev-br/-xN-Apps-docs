import { TestBed } from '@angular/core/testing';

import { IlustradorService } from './ilustrador.service';

describe('IlustradorService', () => {
  let service: IlustradorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IlustradorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
